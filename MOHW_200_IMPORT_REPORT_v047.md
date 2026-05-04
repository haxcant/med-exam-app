# MOHW 200 基準方劑匯入報告 v047-mohw200-authority

## 匯入結果
- 來源：衛生福利部中醫藥司：基準方劑（https://dep.mohw.gov.tw/DOCMAP/lp-866-108.html）
- 原始官方紀錄數：200
- 新增／更新題庫分類：`mohw_200_formula_authority`（衛福部200基準方）
- 本次生成 MOHW 題數：200
- 原 med_questions 題數：813
- 移除舊 MOHW 生成題數：200
- 匯入後 med_questions 題數：813
- 方劑精靈訓練列總數：813
- 方劑精靈問題特徵總數：5987
- 方劑精靈 vocab 總數：2802

## 專案接線
- 新增考試範圍：`mohw_200_formula_authority` → 衛福部200基準方
- 新增分類標籤：`mohw_200_formula_authority` → 衛福部200基準方
- 題庫儀表板已納入第四個核心題庫。
- 方劑精靈 `formula_genie_data.js` 已加入 `mohwFormulaAuthorityV076`、MOHW synthetic training rows、MOHW official features 與 direct phrase extractors。
- 已更新 cache-busting query：`20260504mohw200`，並更新 Service Worker cache name。

## 官方資料品質註記
- 唯一項次數：199 / 200
- 重複項次：['122']
- 缺項次：['123']
- 處理方式：不以項次作為唯一 ID，題目 ID 改用官方細頁 URL 中的 cp 編號，例如 `MOHW-5524`，因此可保留重複項次且不破壞資料結構。

## 題庫分類數
```json
{
  "jingui_formula": 199,
  "mohw_200_formula_authority": 200,
  "tcm_internal_formula": 277,
  "wenbing_formula": 137
}
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
