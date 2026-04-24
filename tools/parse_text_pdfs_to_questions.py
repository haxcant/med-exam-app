import json, re, fitz
from pathlib import Path

FULLWIDTH_NUMS = str.maketrans({
    "０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9",
    "（":"(", "）":")"
})
LAW_TOPIC_LABELS={
    "01":"路口安全","02":"轉彎","03":"行駛中應注意事項","04":"正確使用燈光","05":"注意大型車行駛及轉彎",
    "06":"貨物裝載","07":"事故預防及處理","08":"禁止不當行為","09":"行車檢查","10":"其他"
}

def collect_lines(path: str):
    skip_exact={"題號","答案","題    目","題   目","分類編號","分類編","分類","編號","號","題號  答案"}
    doc=fitz.open(path)
    out=[]
    for pno,p in enumerate(doc,1):
        for raw in p.get_text().splitlines():
            ln=raw.replace("\u3000", " ").strip()
            if not ln: continue
            if ln.startswith("第") and "頁/共" in ln: continue
            if ln in skip_exact or "欄位說明" in ln or "分類項目內容" in ln: continue
            if ln.startswith("機械常識選擇題") or ln.startswith("機械常識是非題") or ln.startswith("汽車法規選擇題") or ln.startswith("汽車法規是非題"): continue
            out.append((ln,pno))
    return out

option_pat = re.compile(r"\((1|2|3)\)")

def normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s.translate(FULLWIDTH_NUMS)).strip()

def split_options(qtext: str):
    s = normalize_text(qtext)
    matches = list(option_pat.finditer(s))
    if len(matches) < 3:
        return None
    stem = s[:matches[0].start()].strip().rstrip("：:?？。.")
    opts=[]
    for i,m in enumerate(matches[:3]):
        start = m.end()
        end = matches[i+1].start() if i+1 < 3 else len(s)
        opts.append(s[start:end].strip())
    return stem, opts
