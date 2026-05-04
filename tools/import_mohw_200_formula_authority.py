#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import MOHW 200 official formula authority data into the MED-EXAM static app.

Inputs expected at project root or /mnt/data during this handoff:
  - mohw_200_formula_authority_full_v076_REAL.json

Outputs updated/created:
  - data/mohw_200_formula_authority_v076.json
  - data/mohw_200_formula_authority_v076.js
  - med_questions.js
  - formula_genie_data.js
  - app.js / index.html / service-worker.js small wiring updates
  - MOHW_200_IMPORT_REPORT_v047.md

The script is deterministic. Re-run it after replacing the source JSON to regenerate the
MOHW question bank and formula-genie synthetic training rows.
"""
from __future__ import annotations

import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUTS = [
    ROOT / "mohw_200_formula_authority_full_v076_REAL.json",
    ROOT / "data" / "mohw_200_formula_authority_full_v076_REAL.json",
    Path("/mnt/data/mohw_200_formula_authority_full_v076_REAL.json"),
]
VERSION = "v047-mohw200-authority"
CACHE_BUST = "20260504mohw200"
CATEGORY = "mohw_200_formula_authority"
SCOPE = "mohw_200_formula_authority"

PUNCT_RE = re.compile(r"[\s\r\n\t，,、。；;：:（）()【】\[\]「」『』《》<>〈〉/／\\|｜＋+]+")
DOSAGE_FORM_RE = re.compile(r"《[^》]+》")
CP_ID_RE = re.compile(r"cp-866-(\d+)-108\.html")

BROAD_KEYWORDS = [
    "寒", "熱", "虛", "實", "表", "裡", "裏", "濕", "痰", "瘀", "水", "火", "燥", "風", "毒",
    "氣", "血", "陰", "陽", "津", "液", "肺", "脾", "胃", "腎", "肝", "心", "膽", "腸",
    "咳", "喘", "痛", "渴", "汗", "嘔", "吐", "瀉", "痢", "痹", "疸", "悸", "眠", "閉",
]
COMMON_HERBS = [
    "熟地黃", "生地黃", "地黃", "山茱萸", "山藥", "澤瀉", "牡丹皮", "茯苓", "知母", "黃柏", "枸杞子",
    "菊花", "人參", "黨參", "黃耆", "白朮", "蒼朮", "甘草", "炙甘草", "半夏", "陳皮", "青皮",
    "柴胡", "黃芩", "黃連", "大黃", "芒硝", "桂枝", "肉桂", "附子", "炮附子", "乾薑", "生薑",
    "當歸", "川芎", "白芍", "赤芍", "桃仁", "紅花", "丹參", "麥門冬", "麥冬", "天門冬", "天冬",
    "石膏", "粳米", "麻黃", "杏仁", "桔梗", "貝母", "瓜蔞", "栝蔞", "厚朴", "枳實", "枳殼",
    "香附", "砂仁", "木香", "藿香", "薄荷", "連翹", "金銀花", "銀花", "防風", "羌活", "獨活",
    "牛膝", "杜仲", "續斷", "葛根", "升麻", "細辛", "五味子", "酸棗仁", "遠志", "龍骨", "牡蠣",
    "竹茹", "鈎藤", "鉤藤", "大棗", "蓮子", "薏苡仁", "白扁豆", "滑石", "木通", "車前子",
]

EFFECT_GROUPS = {
    "補益": ["補", "益", "養", "滋", "溫補", "健脾", "補氣", "補血", "滋陰", "補腎", "益氣"],
    "清熱": ["清熱", "瀉火", "降火", "涼血", "解毒", "清肝", "清心", "清肺", "清胃"],
    "解表": ["發汗", "解表", "疏風", "散寒", "辛涼", "辛溫"],
    "理氣": ["理氣", "行氣", "降氣", "疏肝", "和胃", "寬中"],
    "祛濕": ["祛濕", "利濕", "燥濕", "滲濕", "化濕", "利水", "消腫"],
    "化痰": ["化痰", "祛痰", "除痰", "滌痰", "止咳", "平喘"],
    "活血": ["活血", "化瘀", "祛瘀", "逐瘀", "止血", "涼血"],
    "攻下": ["攻下", "瀉下", "通便", "潤腸", "消積", "導滯", "峻下"],
    "安神": ["安神", "定驚", "鎮驚", "寧心"],
    "止痛": ["止痛", "緩急", "舒筋", "通絡", "止痙"],
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_formula_name(name: str) -> str:
    return DOSAGE_FORM_RE.sub("", str(name or "")).strip()


def cp_id_from_url(url: str, fallback: str) -> str:
    m = CP_ID_RE.search(str(url or ""))
    return m.group(1) if m else fallback


def norm_text(s: str) -> str:
    x = str(s or "")
    table = str.maketrans({"裏": "裡", "溼": "濕", "凉": "涼", "鈎": "鉤"})
    x = x.translate(table)
    x = re.sub(r"[\r\n\t]+", " ", x)
    x = re.sub(r"\s+", " ", x)
    return x.strip()


def split_phrases(*texts: str) -> List[str]:
    out: List[str] = []
    seen = set()
    for text in texts:
        for part in PUNCT_RE.split(norm_text(text)):
            part = part.strip(" .．-—_＿")
            if not part or not re.search(r"[\u4e00-\u9fff]", part):
                continue
            if len(part) < 2 or len(part) > 24:
                continue
            if part not in seen:
                seen.add(part)
                out.append(part)
    return out


def extract_herbs(prescription: str) -> List[str]:
    text = norm_text(prescription)
    found: List[str] = []
    for herb in COMMON_HERBS:
        if herb in text and herb not in found:
            found.append(herb)
    # Also capture item-like strings before dosage numbers.
    for token in split_phrases(re.sub(r"[0-9.]+", " ", text)):
        if 2 <= len(token) <= 5 and token not in found and not any(x in token for x in ["一日", "公克", "傳統", "製劑", "適量", "飲片量"]):
            if len(found) < 14:
                found.append(token)
    return found[:16]


def effect_group(effect: str, indications: str) -> str:
    text = norm_text(effect + " " + indications)
    best = "其他"
    best_count = 0
    for group, keys in EFFECT_GROUPS.items():
        c = sum(1 for k in keys if k in text)
        if c > best_count:
            best = group
            best_count = c
    return best


def add_feature(features: Dict[str, float], key: str, weight: float) -> None:
    key = norm_text(key)
    if not key or not re.search(r"[\u4e00-\u9fff]", key):
        return
    if len(key) > 28:
        return
    features[key] = max(float(features.get(key, 0)), round(float(weight), 3))


def build_features(record: Dict[str, Any]) -> Dict[str, float]:
    clean_name = clean_formula_name(record.get("official_name", ""))
    official_name = str(record.get("official_name", ""))
    origin = str(record.get("origin", ""))
    effect = str(record.get("effect", ""))
    indications = str(record.get("indications", ""))
    prescription = str(record.get("prescription", ""))
    caution = str(record.get("caution", ""))
    features: Dict[str, float] = {}

    add_feature(features, clean_name, 5.0)
    if official_name != clean_name:
        add_feature(features, official_name, 4.0)
    add_feature(features, origin, 1.35)
    for phrase in split_phrases(effect):
        add_feature(features, phrase, 3.2 if len(phrase) >= 4 else 1.4)
    for phrase in split_phrases(indications):
        add_feature(features, phrase, 3.6 if len(phrase) >= 4 else 1.8)
    for phrase in split_phrases(caution):
        add_feature(features, phrase, 1.1)
    for herb in extract_herbs(prescription):
        add_feature(features, herb, 1.25)
    text = norm_text(" ".join([effect, indications, prescription, caution]))
    for key in BROAD_KEYWORDS:
        if key in text:
            add_feature(features, key, 0.45)
    grp = effect_group(effect, indications)
    if grp != "其他":
        add_feature(features, grp, 1.0)
    # useful adjacent phrases in indications/effect
    toks = split_phrases(effect, indications)
    for i in range(len(toks) - 1):
        pair = toks[i] + toks[i + 1]
        if 4 <= len(pair) <= 18:
            add_feature(features, pair, 2.2)
    return dict(sorted(features.items(), key=lambda kv: (-kv[1], kv[0])))


def build_prompt(record: Dict[str, Any]) -> str:
    parts = ["下列衛福部中醫藥司基準方劑資料，最符合何方？"]
    if record.get("origin"):
        parts.append(f"出典：{record['origin']}")
    if record.get("effect"):
        parts.append(f"效能：{record['effect']}")
    if record.get("indications"):
        parts.append(f"適應症：{record['indications']}")
    herbs = extract_herbs(record.get("prescription", ""))[:8]
    if herbs:
        parts.append("處方關鍵：" + "、".join(herbs))
    return "\n".join(parts)


def build_explanation(record: Dict[str, Any]) -> str:
    lines = [
        f"官方方名：{record.get('official_name','')}",
        f"項次：{record.get('item_no','')}",
        f"出典：{record.get('origin','')}",
        f"效能：{record.get('effect','')}",
        f"適應症：{record.get('indications','')}",
        f"處方：{record.get('prescription','')}",
    ]
    if record.get("caution"):
        lines.append(f"注意事項：{record.get('caution')}")
    lines.extend([
        f"官方來源：{record.get('source_url','')}",
        "使用提醒：本題依衛福部中醫藥司基準方劑官方欄位整理，定位為考試與資料庫檢索輔助，不是臨床處方建議。",
    ])
    return "\n".join(lines)


def make_tags(record: Dict[str, Any]) -> List[str]:
    tags = ["衛福部", "基準方劑", "官方方劑"]
    origin = str(record.get("origin") or "").strip()
    if origin:
        tags.append(f"出典：{origin}")
    grp = effect_group(str(record.get("effect", "")), str(record.get("indications", "")))
    if grp != "其他":
        tags.append(grp)
    for key in ["補益", "清熱", "解表", "祛濕", "化痰", "活血", "攻下", "安神", "理氣", "止痛"]:
        if key not in tags and key in grp:
            tags.append(key)
    return tags[:8]


def choose_options(records: List[Dict[str, Any]], idx: int, answer: str, features_by_idx: List[Dict[str, float]]) -> List[str]:
    target_feats = set(features_by_idx[idx])
    target_group = effect_group(records[idx].get("effect", ""), records[idx].get("indications", ""))
    candidates: List[Tuple[float, int, str]] = []
    for j, r in enumerate(records):
        if j == idx:
            continue
        name = clean_formula_name(r.get("official_name", ""))
        if name == answer:
            continue
        feats = set(features_by_idx[j])
        overlap = len(target_feats & feats)
        same_group = effect_group(r.get("effect", ""), r.get("indications", "")) == target_group
        score = overlap + (5 if same_group else 0)
        # deterministic tie breaker with distance, not random
        candidates.append((score, -abs(j - idx), name))
    candidates.sort(reverse=True)
    opts = [answer]
    for _, _, name in candidates:
        if name not in opts:
            opts.append(name)
        if len(opts) >= 4:
            break
    # Deterministic rotation so answer is not always first.
    rot = (idx * 3 + 1) % len(opts)
    return opts[rot:] + opts[:rot]


def parse_med_questions(path: Path) -> List[Dict[str, Any]]:
    s = path.read_text(encoding="utf-8")
    m = re.search(r"window\.MED_QUESTION_BANK\s*=\s*(\[.*\])\s*;\s*$", s, re.S)
    if not m:
        raise RuntimeError("Cannot parse med_questions.js")
    return json.loads(m.group(1))


def write_med_questions(path: Path, arr: List[Dict[str, Any]]) -> None:
    path.write_text("window.MED_QUESTION_BANK = " + json.dumps(arr, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")


def parse_formula_data(path: Path) -> Dict[str, Any]:
    s = path.read_text(encoding="utf-8")
    m = re.search(r"window\.FORMULA_VECTOR_WEIGHTS_V015\s*=\s*(\{.*\})\s*;\s*$", s, re.S)
    if not m:
        raise RuntimeError("Cannot parse formula_genie_data.js")
    return json.loads(m.group(1))


def write_formula_data(path: Path, obj: Dict[str, Any]) -> None:
    path.write_text("window.FORMULA_VECTOR_WEIGHTS_V015 = " + json.dumps(obj, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")


def ensure_unique_ids(arr: Iterable[Dict[str, Any]]) -> None:
    ids = [q.get("id") for q in arr]
    dup = [x for x, c in Counter(ids).items() if c > 1]
    if dup:
        raise RuntimeError(f"Duplicate question ids after import: {dup[:10]}")


def build_mohw_question_records(records: List[Dict[str, Any]], features_by_idx: List[Dict[str, float]]) -> List[Dict[str, Any]]:
    out = []
    for idx, r in enumerate(records):
        cp = cp_id_from_url(r.get("source_url", ""), f"row{idx+1:03d}")
        qid = f"MOHW-{cp}"
        answer = clean_formula_name(r.get("official_name", ""))
        out.append({
            "id": qid,
            "category": CATEGORY,
            "kind": "text_choice",
            "prompt": build_prompt(r),
            "answer": answer,
            "source": {
                "provider": "衛生福利部中醫藥司",
                "collection": "基準方劑",
                "sourceUrl": r.get("source_url", ""),
                "itemNo": r.get("item_no", ""),
                "officialName": r.get("official_name", ""),
                "origin": r.get("origin", ""),
                "topicLabel": "衛福部200基準方劑",
                "schemaVersion": "mohw_formula_authority_full_v076",
            },
            "explanation": build_explanation(r),
            "tags": make_tags(r),
            "difficulty": 2,
            "options": choose_options(records, idx, answer, features_by_idx),
        })
    return out


def build_mohw_static_data(source: Dict[str, Any], records: List[Dict[str, Any]], features_by_idx: List[Dict[str, float]], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    item_counts = Counter(r.get("item_no", "") for r in records)
    return {
        "schema_version": "med_exam_mohw_200_authority_v047",
        "source_schema_version": source.get("schema_version"),
        "source": source.get("source"),
        "source_url": source.get("source_url"),
        "collection_method": source.get("collection_method"),
        "import_version": VERSION,
        "records_count": len(records),
        "unique_item_no_count": len(item_counts),
        "duplicated_item_no": sorted([k for k, v in item_counts.items() if v > 1]),
        "missing_item_no_001_200": [f"{i:03d}" for i in range(1, 201) if f"{i:03d}" not in item_counts],
        "records": [
            {
                **r,
                "clean_name": clean_formula_name(r.get("official_name", "")),
                "med_question_id": questions[i]["id"],
                "auto_tags": questions[i]["tags"],
                "formula_genie_features": features_by_idx[i],
            }
            for i, r in enumerate(records)
        ],
    }


def build_mohw_js(data: Dict[str, Any]) -> str:
    return "window.MOHW_200_FORMULA_AUTHORITY_V076 = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"


def update_formula_genie(data: Dict[str, Any], records: List[Dict[str, Any]], features_by_idx: List[Dict[str, float]], questions: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    # Remove any previous generated MOHW rows/features before re-adding.
    rows = [r for r in data.get("oracleTrainingRowsV015", []) if not str(r.get("id", "")).startswith("MOHW-")]
    qbank = [q for q in data.get("oracleQuestionBankV015", []) if not str(q.get("id", "")).startswith("MOHW_OQ_")]
    direct = dict(data.get("directPhrasesV015", {}) or {})
    for k in list(direct.keys()):
        v = direct[k]
        if isinstance(v, list):
            kept = [x for x in v if not str(x).startswith("MOHW::")]
            if kept:
                direct[k] = kept
            else:
                direct.pop(k, None)
        elif isinstance(v, str) and v.startswith("MOHW::"):
            direct.pop(k, None)

    for i, (r, q, feats) in enumerate(zip(records, questions, features_by_idx)):
        answer = q["answer"]
        clean_name = clean_formula_name(r.get("official_name", ""))
        row_prompt = " ".join([
            clean_name,
            str(r.get("origin", "")),
            str(r.get("effect", "")),
            str(r.get("indications", "")),
            " ".join(extract_herbs(r.get("prescription", ""))[:12]),
        ]).strip()
        rows.append({
            "id": q["id"],
            "prompt": row_prompt,
            "answer": answer,
            "options": q["options"],
            "features": feats,
            "sourceLayer": "mohw_official_formula_v076",
            "mohw": {
                "itemNo": r.get("item_no", ""),
                "officialName": r.get("official_name", ""),
                "origin": r.get("origin", ""),
                "effect": r.get("effect", ""),
                "indications": r.get("indications", ""),
                "prescription": r.get("prescription", ""),
                "caution": r.get("caution", ""),
                "sourceUrl": r.get("source_url", ""),
            },
        })
        for f, w in feats.items():
            cls = "signature" if len(f) >= 4 and w >= 2 else "support" if w >= 1 else "broad"
            qbank.append({
                "id": "MOHW_OQ_" + re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]+", "_", f)[:60],
                "feature": f,
                "text": f"題幹或症狀是否明確包含／指向衛福部基準方劑線索「{f}」？",
                "quality": round(8.0 + min(float(w), 5.0) * 2.5, 4),
                "class": cls,
                "formulaDf": 1,
                "rowDf": 1,
                "sourceLayer": "mohw_official_formula_v076",
            })
        # Direct phrase keys are used as exact feature extractors by matcher.
        for phrase in [clean_name, str(r.get("official_name", "")), *split_phrases(r.get("effect", "")), *split_phrases(r.get("indications", ""))]:
            if phrase:
                vals = direct.get(phrase, [])
                if not isinstance(vals, list):
                    vals = [vals]
                marker = "MOHW::" + answer
                if marker not in vals:
                    vals.append(marker)
                direct[phrase] = vals

    # De-duplicate question bank by feature + sourceLayer, keeping the stronger-quality one.
    best_q: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for q in qbank:
        key = (str(q.get("feature", "")), str(q.get("sourceLayer", "")))
        if not key[0]:
            continue
        if key not in best_q or float(q.get("quality", 0) or 0) > float(best_q[key].get("quality", 0) or 0):
            best_q[key] = q
    qbank2 = sorted(best_q.values(), key=lambda x: (-float(x.get("quality", 0) or 0), str(x.get("feature", ""))))

    # Extend vocab for display/statistics. Existing IDs are preserved; new IDs appended.
    vocab = dict(data.get("vocab", {}) or {})
    next_id = max([int(v) for v in vocab.values() if isinstance(v, int)] or [-1]) + 1
    for feats in features_by_idx:
        for f in feats:
            if f not in vocab:
                vocab[f] = next_id
                next_id += 1

    data["oracleTrainingRowsV015"] = rows
    data["oracleQuestionBankV015"] = qbank2
    data["directPhrasesV015"] = dict(sorted(direct.items(), key=lambda kv: kv[0]))
    data["vocab"] = dict(sorted(vocab.items(), key=lambda kv: kv[1] if isinstance(kv[1], int) else 10**9))
    data["mohwFormulaAuthorityV076"] = {
        "source": "衛生福利部中醫藥司：基準方劑",
        "sourceUrl": "https://dep.mohw.gov.tw/DOCMAP/lp-866-108.html",
        "importVersion": VERSION,
        "records": [
            {
                "id": q["id"],
                "itemNo": r.get("item_no", ""),
                "officialName": r.get("official_name", ""),
                "cleanName": q["answer"],
                "origin": r.get("origin", ""),
                "effect": r.get("effect", ""),
                "indications": r.get("indications", ""),
                "sourceUrl": r.get("source_url", ""),
            }
            for r, q in zip(records, questions)
        ],
    }
    stats = dict(data.get("stats", {}) or {})
    stats.update({
        "formulaCount": len(set(row.get("answer") for row in rows if row.get("answer"))),
        "featureCount": len(data["vocab"]),
        "questionCount": len(qbank2),
        "mohwAuthorityRecords": len(records),
        "mohwAuthorityTrainingRows": len(questions),
        "mohwAuthorityImportVersion": VERSION,
    })
    raw_counts = dict(stats.get("rawInputCounts", {}) or {})
    raw_counts["mohw_official_authority_v076"] = len(records)
    stats["rawInputCounts"] = raw_counts
    data["stats"] = stats
    audit = dict(data.get("questionBankAuditV015", {}) or {})
    audit.update({
        "mohwAuthorityRows": len(records),
        "mohwAuthorityQuestionIds": len(questions),
        "mohwAuthorityFormulaProfiles": len(set(q["answer"] for q in questions)),
    })
    data["questionBankAuditV015"] = audit
    data["version"] = VERSION
    data["description"] = (data.get("description", "") + " + MOHW 200 official formula authority rows integrated as maintainable source layer.").strip()
    data["generatedBy"] = "tools/import_mohw_200_formula_authority.py"
    return len(rows), len(qbank2), len(data["vocab"])


def replace_once(text: str, old: str, new: str) -> str:
    if old not in text:
        raise RuntimeError(f"Expected text not found: {old[:80]}")
    return text.replace(old, new, 1)


def patch_app_js(path: Path) -> None:
    s = path.read_text(encoding="utf-8")
    if "mohw_200_formula_authority: \"衛福部200基準方\"" not in s:
        s = replace_once(s, '    wenbing_formula: "溫病條文題庫",\n', '    wenbing_formula: "溫病條文題庫",\n    mohw_200_formula_authority: "衛福部200基準方",\n')
    if 'mohw_200_formula_authority: "衛福部200基準方"' not in s[s.find('const EXAM_SCOPE_LABELS'):s.find('const EXAM_SCOPE_DESCRIPTIONS')]:
        s = replace_once(s, '    wenbing_formula: "溫病條文題庫",\n    official_plus_mechanical:', '    wenbing_formula: "溫病條文題庫",\n    mohw_200_formula_authority: "衛福部200基準方",\n    official_plus_mechanical:')
    if 'mohw_200_formula_authority: "衛福部中醫藥司基準方劑' not in s:
        s = replace_once(s, '    wenbing_formula: "溫病條文題庫：以標題＋條文證候作為題幹，從選項中選出正確方劑。",\n', '    wenbing_formula: "溫病條文題庫：以標題＋條文證候作為題幹，從選項中選出正確方劑。",\n    mohw_200_formula_authority: "衛福部中醫藥司基準方劑：依官方項次、方名、出典、效能、適應症、處方與注意事項整理成可維護題庫。",\n')
    s = s.replace('const CORE_EXAM_SCOPES = ["official_small_car", "tcm_internal_formula", "wenbing_formula"];', 'const CORE_EXAM_SCOPES = ["official_small_car", "tcm_internal_formula", "wenbing_formula", "mohw_200_formula_authority"];')
    if "function isMohwFormulaQuestion" not in s:
        insert = '''\n  function isMohwFormulaQuestion(question) {\n    return !!(\n      question?.id?.startsWith("MOHW-") ||\n      question?.category === "mohw_200_formula_authority"\n    );\n  }\n'''
        s = replace_once(s, '''  function isWenbingFormulaQuestion(question) {\n    return !!(\n      question?.id?.startsWith("WBTF-") ||\n      question?.category === "wenbing_formula"\n    );\n  }\n''', '''  function isWenbingFormulaQuestion(question) {\n    return !!(\n      question?.id?.startsWith("WBTF-") ||\n      question?.category === "wenbing_formula"\n    );\n  }\n''' + insert)
    s = s.replace('!isWenbingFormulaQuestion(question));', '!isWenbingFormulaQuestion(question) && !isMohwFormulaQuestion(question));')
    s = s.replace('if (scope === "wenbing_formula") return isWenbingFormulaQuestion(question);\n    if (scope === "official_plus_mechanical") return isOfficialSmallCarQuestion(question) || isTcmInternalFormulaQuestion(question) || isWenbingFormulaQuestion(question) || isMechanicalQuestion(question);', 'if (scope === "wenbing_formula") return isWenbingFormulaQuestion(question);\n    if (scope === "mohw_200_formula_authority") return isMohwFormulaQuestion(question);\n    if (scope === "official_plus_mechanical") return isOfficialSmallCarQuestion(question) || isTcmInternalFormulaQuestion(question) || isWenbingFormulaQuestion(question) || isMohwFormulaQuestion(question) || isMechanicalQuestion(question);')
    s = s.replace('上方儀表板可即時查看三題庫表現。', '上方儀表板可即時查看主要題庫表現。')
    s = s.replace('v0.1.46 方劑精靈', 'v0.1.47 衛福部200方＋方劑精靈')
    path.write_text(s, encoding="utf-8")


def patch_index_html(path: Path) -> None:
    s = path.read_text(encoding="utf-8")
    s = s.replace('v0.1.45：優化「方劑精靈」配色、圖示與結果收納顯示。', 'v0.1.47：匯入衛福部200基準方，新增官方方劑題庫範圍，並重建方劑精靈特徵資料。')
    if '<option value="mohw_200_formula_authority">衛福部200基準方</option>' not in s:
        s = s.replace('<option value="wenbing_formula">溫病條文題庫</option>\n            <option value="official_plus_mechanical">', '<option value="wenbing_formula">溫病條文題庫</option>\n            <option value="mohw_200_formula_authority">衛福部200基準方</option>\n            <option value="official_plus_mechanical">')
    # Bump cache-busting query strings for modified core assets.
    s = re.sub(r'med_questions\.js\?v=[^"\']+', f'med_questions.js?v={CACHE_BUST}', s)
    s = re.sub(r'app\.js\?v=[^"\']+', f'app.js?v={CACHE_BUST}', s)
    s = re.sub(r'formula_genie_matcher\.js\?v=[^"\']+', f'formula_genie_matcher.js?v={CACHE_BUST}', s)
    path.write_text(s, encoding="utf-8")


def patch_matcher(path: Path) -> None:
    s = path.read_text(encoding="utf-8")
    s = re.sub(r"const DATA_SRC = './formula_genie_data\.js\?v=[^']+';", f"const DATA_SRC = './formula_genie_data.js?v={CACHE_BUST}';", s)
    if "function renderMohwMeta" not in s:
        helper = r'''
  function renderMohwMeta(row) {
    const m = row?.mohw;
    if (!m) return '';
    const chips = [];
    if (m.itemNo) chips.push(`項次 ${escapeHtml(m.itemNo)}`);
    if (m.origin) chips.push(`出典：${escapeHtml(m.origin)}`);
    if (m.effect) chips.push(`效能：${escapeHtml(m.effect)}`);
    if (m.indications) chips.push(`適應症：${escapeHtml(m.indications)}`);
    const url = m.sourceUrl ? `<a href="${escapeAttr(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">官方頁</a>` : '';
    return `<div class="formula-genie-source formula-genie-official-source">衛福部基準方劑${chips.length ? '｜' + chips.join('｜') : ''}${url ? '｜' + url : ''}</div>`;
  }
'''
        s = s.replace("  function renderResult(payload) {", helper + "\n  function renderResult(payload) {")
    # matcher did not have escapeAttr helper; add it after escapeHtml if missing.
    if "function escapeAttr" not in s:
        s = s.replace("  function escapeHtml(s) { return String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c])); }", "  function escapeHtml(s) { return String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c])); }\n  function escapeAttr(s) { return escapeHtml(s).replace(/`/g, '&#96;'); }")
    if "${renderMohwMeta(x.row)}" not in s:
        s = s.replace("          <div class=\"formula-genie-source\">來源題：${escapeHtml(x.row?.id || '')}${prompt ? '｜' + escapeHtml(prompt) : ''}</div>\n          ${renderEvidence(x)}", "          <div class=\"formula-genie-source\">來源題：${escapeHtml(x.row?.id || '')}${prompt ? '｜' + escapeHtml(prompt) : ''}</div>\n          ${renderMohwMeta(x.row)}\n          ${renderEvidence(x)}")
    path.write_text(s, encoding="utf-8")


def patch_service_worker(path: Path) -> None:
    s = path.read_text(encoding="utf-8")
    s = re.sub(r"const CACHE_NAME = '.*?';", "const CACHE_NAME = 'med-exam-app-v0.1.47-mohw200-formula-genie';", s)
    for asset in ["styles.css", "memory-bridge.js", "app.js", "formula_genie_matcher.js", "med_questions.js", "firebase-auth.js", "firebase-access.js", "firebase-sync-smoke.js", "firebase-backup.js", "firebase-ui.js", "admin.js"]:
        s = re.sub(re.escape(asset) + r"\?v=[^\"]+", f"{asset}?v={CACHE_BUST}", s)
    path.write_text(s, encoding="utf-8")


def main() -> None:
    source_path = next((p for p in DEFAULT_INPUTS if p.exists()), None)
    if not source_path:
        raise SystemExit("Cannot find MOHW source JSON")
    source = read_json(source_path)
    records = list(source.get("records") or [])
    if len(records) != 200:
        raise RuntimeError(f"Expected 200 MOHW records, got {len(records)}")
    features_by_idx = [build_features(r) for r in records]
    questions = build_mohw_question_records(records, features_by_idx)
    ensure_unique_ids(questions)

    data_dir = ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    raw_copy = data_dir / "mohw_200_formula_authority_full_v076_REAL.json"
    if source_path.resolve() != raw_copy.resolve():
        shutil.copy2(source_path, raw_copy)
    static_data = build_mohw_static_data(source, records, features_by_idx, questions)
    write_json(data_dir / "mohw_200_formula_authority_v076.json", static_data)
    (data_dir / "mohw_200_formula_authority_v076.js").write_text(build_mohw_js(static_data), encoding="utf-8")

    med_path = ROOT / "med_questions.js"
    med_arr = parse_med_questions(med_path)
    before_count = len(med_arr)
    med_arr = [q for q in med_arr if not (str(q.get("id", "")).startswith("MOHW-") or q.get("category") == CATEGORY)]
    removed = before_count - len(med_arr)
    med_arr.extend(questions)
    ensure_unique_ids(med_arr)
    write_med_questions(med_path, med_arr)

    fg_path = ROOT / "formula_genie_data.js"
    fg = parse_formula_data(fg_path)
    rows_count, qbank_count, vocab_count = update_formula_genie(fg, records, features_by_idx, questions)
    write_formula_data(fg_path, fg)

    patch_app_js(ROOT / "app.js")
    patch_index_html(ROOT / "index.html")
    patch_matcher(ROOT / "formula_genie_matcher.js")
    patch_service_worker(ROOT / "service-worker.js")

    item_counts = Counter(r.get("item_no", "") for r in records)
    category_counts = Counter(q.get("category") for q in med_arr)
    report = f"""# MOHW 200 基準方劑匯入報告 {VERSION}

## 匯入結果
- 來源：{source.get('source')}（{source.get('source_url')}）
- 原始官方紀錄數：{len(records)}
- 新增／更新題庫分類：`{CATEGORY}`（衛福部200基準方）
- 本次生成 MOHW 題數：{len(questions)}
- 原 med_questions 題數：{before_count}
- 移除舊 MOHW 生成題數：{removed}
- 匯入後 med_questions 題數：{len(med_arr)}
- 方劑精靈訓練列總數：{rows_count}
- 方劑精靈問題特徵總數：{qbank_count}
- 方劑精靈 vocab 總數：{vocab_count}

## 專案接線
- 新增考試範圍：`{SCOPE}` → 衛福部200基準方
- 新增分類標籤：`{CATEGORY}` → 衛福部200基準方
- 題庫儀表板已納入第四個核心題庫。
- 方劑精靈 `formula_genie_data.js` 已加入 `mohwFormulaAuthorityV076`、MOHW synthetic training rows、MOHW official features 與 direct phrase extractors。
- 已更新 cache-busting query：`{CACHE_BUST}`，並更新 Service Worker cache name。

## 官方資料品質註記
- 唯一項次數：{len(item_counts)} / 200
- 重複項次：{sorted([k for k, v in item_counts.items() if v > 1])}
- 缺項次：{[f'{i:03d}' for i in range(1, 201) if f'{i:03d}' not in item_counts]}
- 處理方式：不以項次作為唯一 ID，題目 ID 改用官方細頁 URL 中的 cp 編號，例如 `MOHW-5524`，因此可保留重複項次且不破壞資料結構。

## 題庫分類數
```json
{json.dumps(dict(sorted(category_counts.items())), ensure_ascii=False, indent=2)}
```

## 後續維護方式
1. 將新的官方 JSON 覆蓋 `data/mohw_200_formula_authority_full_v076_REAL.json`。
2. 在專案根目錄執行：
   ```bash
   python tools/import_mohw_200_formula_authority.py
   python tests/question_bank_check.py
   ```
3. 若官方項次修正，仍建議保留以 cp 編號產生的題目 ID，避免使用者舊進度因題號變動而遺失。

## 注意
本匯入是考試／資料檢索用途；衛福部基準方劑資料不等於臨床處方建議。
"""
    (ROOT / "MOHW_200_IMPORT_REPORT_v047.md").write_text(report, encoding="utf-8")

    print(report)


if __name__ == "__main__":
    main()
