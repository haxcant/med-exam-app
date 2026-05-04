# Formula Genie v050 泛化辨證與算法展示修正報告

## 目的

本版不是單純調整權重，而是把方劑精靈從「題幹／特徵相似度檢索」升級為較適合展示算法優勢的「分層模擬辨證 ranker」。定位仍為考試與學習展示用，不作臨床診療或實際處方建議。

## 主要新增

1. **泛化辨證同義層**
   - 新增 `DIAGNOSTIC_ALIAS_GROUPS`。
   - 將口語症狀與改寫句轉成較穩定的辨證特徵，例如：
     - 乾嘔／噁心／胃氣上逆 → 嘔逆
     - 熱病後口渴／胃裡像有熱 → 胃熱陰傷
     - 外感受寒、鼻塞流清涕、痰白清稀 → 風寒襲肺
     - 眼睛乾澀、視物不清、頭暈目眩 → 肝腎陰虛

2. **模擬辨證結果卡**
   - 結果區新增：
     - 最可能候選
     - 可能證型
     - 病機摘要
     - 方義／來源摘要
     - 展示算法優勢說明
     - 主要命中特徵與貢獻分數
     - 建議補問／鑑別線索
   - 保留原本「命中特徵與權重表」。

3. **展示案例按鈕**
   - UI 新增「展示案例」按鈕。
   - 會輪流放入泛化改寫、症狀敘述、地黃丸家族、組成查方、不確定案例。
   - 方便現場展示：不是只拿原題題幹測試。

4. **演算法優勢展示評估**
   - 新增 `tools/formula_genie_generalization_eval_v050.js`。
   - 新增輸出 `FORMULA_GENIE_GENERALIZATION_EVAL_v050.json`。
   - 評估非原題輸入，包括同義改寫、衛福部方義改寫、經典辨證、組成查方與刻意不完整輸入。
   - 另附 naive token-overlap baseline top5，供展示比較；此 baseline 只作展示，不作正式研究指標。

## 驗證結果

### 自身題幹校準

| 模式 | Top-1 | 正解在候選內 |
|---|---:|---:|
| prompt only | 792 / 813 = 97.42% | 813 / 813 = 100% |
| prompt + options | 813 / 813 = 100% | 813 / 813 = 100% |

prompt-only 不是 100% 的原因仍然是題庫中存在同一題幹／同一古文對應多個答案的天然歧義。完整題目含選項時為 100%。

### 泛化展示測試

`FORMULA_GENIE_GENERALIZATION_EVAL_v050.json` 結果：

| 指標 | 結果 |
|---|---:|
| 測試案例數 | 8 |
| Top-1 success | 7 / 8 = 87.5% |
| Top-5 success | 8 / 8 = 100% |

其中 1 題是刻意不完整的咳嗽案例，成功標準不是 Top-1，而是能列出多候選並在 UI 補問。

### 程式檢查

已執行：

```bash
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
node --check service-worker.js
python3 tests/question_bank_check.py
node tools/formula_genie_ranker_smoke_v048.js
node tools/formula_genie_self_stem_eval_v049.js
node tools/formula_genie_generalization_eval_v050.js
```

全部通過。

## 重要限制

1. 這不是臨床診療系統。它只能作為考試、題庫、演算法展示與學習輔助。
2. 泛化層目前是小型、可維護的辨證同義表，不是大型語意模型。
3. 若輸入資訊不足，系統仍可能列出排序候選；所以 UI 已加入補問與「不作臨床建議」提示。
4. naive baseline 僅供展示，不應包裝成正式論文對照實驗。若要做論文級對照，需固定測試集、盲測、定義 baseline 與統計檢定。

## 後續可再加的展示功能

1. 一鍵輸出目前查詢的 JSON evidence trace。
2. 建立 50～100 題人工改寫泛化測試集。
3. 加入「診斷模式／背方模式／組成查方模式」切換。
4. 加入候選方劑間的差異熱點，例如「A 方有嘔逆，B 方有痰熱」。
5. 產生圖表化算法流程：Exact Stem → Ontology Expansion → Candidate Recall → Hybrid Rerank → Diagnostic Summary。
