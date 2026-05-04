# Formula Genie v049 自身題幹命中校準報告

## 修正目的

本版針對「把專案自己的題目／古文題幹輸入方劑精靈時，第一名是否回到該題答案」進行修正。v048 的一般相似度排序仍可能被相近病機、衛福部官方方或重複題幹干擾，因此 v049 新增一層 **self-stem exact index（自身題幹精準命中層）**。

## 核心改動

1. `formula_genie_matcher.js` 新增 `selfStemKey()`、`buildSelfStemIndex()`、`findSelfStemHits()`。
2. 每題建立多種可命中的自身題幹索引：
   - 題幹原文
   - 去除填空底線後的題幹
   - 題幹 + 選項
   - 題幹 +「選項」+ 選項
   - explanation 中的「原文：...」行，僅在不歧義時作為精準命中
3. 若輸入完全命中且只對應一個答案，直接把該答案放到第 1 名。
4. 若輸入題幹完全命中但同一題幹在題庫中對應多個答案，結果會把這些候選列為高分候選，並在「命中特徵與權重」中提示：需加入選項或題號才能精準鎖定。
5. 保留並強化「命中特徵與權重」表格。即使是自身題幹精準命中，也會顯示：
   - `題庫自身題幹完全命中`
   - 輸入權重
   - 題庫權重
   - 貢獻分數
   - 其他從該題特徵列抽出的輔助線索

## 驗證結果

使用 `tools/formula_genie_self_stem_eval_v049.js` 驗證 813 題。

### A. 只輸入 prompt 題幹

- 總題數：813
- Top-1 命中：792 / 813 = 97.42%
- Top-20 包含正解：813 / 813 = 100%
- 自身題幹唯一精準命中：773 題
- 題幹歧義：40 題

prompt-only 未達 100% 的原因不是演算法沒學到，而是資料本身存在「同一題幹／同一古文對應多個答案」的情況，例如中醫內科同一證候搭配不同選項時答案不同，或同一溫病條文可在不同題目中問不同方。只輸入題幹而不輸入選項時，從資訊論上無法唯一判定是哪一題。

### B. 輸入完整題目：prompt + 選項

- 總題數：813
- Top-1 命中：813 / 813 = 100%
- Top-20 包含正解：813 / 813 = 100%
- 自身題幹唯一精準命中：813 題
- 題幹歧義：0 題

## 驗證指令

```bash
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
python3 tests/question_bank_check.py
node tools/formula_genie_ranker_smoke_v048.js
node tools/formula_genie_self_stem_eval_v049.js > FORMULA_GENIE_SELF_STEM_EVAL_v049.json
```

## 實務結論

- 若使用者貼「完整題目含選項」，方劑精靈會 100% 回到該題答案。
- 若只貼古文／題幹，所有正解都會出現在候選中；但遇到同題幹多答案時，不保證每一題都能同時 Top-1，因為輸入本身不足以區分題目。
- 結果卡仍保留特徵、權重與貢獻分數，不會變成純黑盒 lookup。
