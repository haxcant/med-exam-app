# Changelog

## v0.1.47 - MOHW 200 基準方劑匯入
- 新增 `mohw_200_formula_authority` 題庫分類與考試範圍「衛福部200基準方」。
- 由衛福部中醫藥司基準方劑官方欄位生成 200 題文字選方題，保留官方方名、出典、效能、適應症、處方、注意事項與來源 URL。
- 方劑精靈已重新整合 MOHW official training rows、features、direct phrases 與 `mohwFormulaAuthorityV076` 資料層。
- 新增 `data/mohw_200_formula_authority_v076.json/js` 與 `tools/import_mohw_200_formula_authority.py`，後續可覆蓋官方 JSON 後重跑匯入。
- 已更新 Service Worker cache name 與主要 JS cache-busting query。

## v21.6
- 整理完整基準包
- 修正字幕接龍切換、顯示與累積邏輯
- 字幕接龍共用影片考試同一題庫
- 目前這一步放到接龍影片下方
- 更新 service worker 快取版本
