# 方劑精靈排序修正報告 v0.1.48

## 問題
匯入衛福部 200 基準方後，`formula_genie_matcher.js` 原本採用「特徵直接累加 + substring fallback + family fallback」的排序方式。MOHW 官方列含有效能、適應症、處方藥材與粗分類關鍵字，因此在輸入一般症狀或短題幹時，容易累積大量弱命中，導致結果頁看起來幾乎都被衛福部方劑佔據。

## 修正方向
本版沒有移除 MOHW 資料，而是改成分層排序：

1. 自動判斷輸入意圖：
   - 官方／衛福部基準方查詢
   - 組成／藥材查方
   - 考題／條文／辨證題幹
   - 方名直接查詢
   - 一般症狀描述

2. 特徵分級：
   - 方名：最高權重
   - signature 長線索：較高權重
   - support 一般線索：中等權重
   - herb 藥材：只有在組成查方時提高權重；一般辨證時降權
   - broad 粗軸線索：大幅降權，例如寒、熱、虛、實、氣、血、陰、陽等

3. 降低 MOHW 弱命中洗版：
   - 非官方查詢時，MOHW-only rows 使用來源係數降權。
   - 若只有粗線索或高頻藥材命中，進一步降權。
   - 移除舊版過強的 family fallback，避免「熱、胃、陰」等弱相似度被大量累加。
   - 同一方劑同時存在經典／考題列與 MOHW 列時，會聚合分數，但普通輸入優先展示經典／考題來源。

4. 保留 MOHW 的正確用途：
   - 輸入含「衛福部、基準方、官方、項次」時，MOHW 資料會正常提高權重。
   - 輸入多個藥材或「組成、成分、配方、處方、藥味」時，會進入組成查方模式。

## 修改檔案
- `formula_genie_matcher.js`
- `index.html`
- `app.js`
- `service-worker.js`
- `tools/formula_genie_ranker_smoke_v048.js`

## 驗證
已執行：

```bash
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
python3 tests/question_bank_check.py
node tools/formula_genie_ranker_smoke_v048.js
```

結果均通過。

## Smoke cases
- `胃熱陰傷 煩渴 嘔逆 少氣` → Top 1：竹葉石膏湯
- `風溫 誤汗 身熱多眠 鼻鼾 語言難出` → Top 1：竹葉石膏湯
- `腫脹 消渴兼證` → Top 3 含杞菊地黃丸／參苓白朮散
- `痙太陽病 無汗而小便反少 氣上衝胸 口噤不得語 欲作剛痙` → Top 1：葛根湯
- `衛福部 六味地黃丸 滋陰補腎 肝腎不足 消渴` → Top 1：六味地黃丸
- `熟地黃 山茱萸 山藥 澤瀉 牡丹皮 茯苓` → Top 3 含地黃丸系方劑

## 注意
本版是排序修正，不是重新產生全部題庫資料。若未來新增完整「方劑組成結構化資料層」，建議再把藥材特徵改為 IDF 權重與藥對／方群鑑別權重，效果會更穩。
