# v056 雲端上傳權限誤判修復報告

## 問題
v055 上傳雲端時可能出現：

> 你已登入，但尚未開通雲端同步權限，或 app_config/global.syncEnabled 不是 true。

但使用者其實已經登入、allowlist 與 `app_config/global.syncEnabled` 也都正確。

## 根因
v055 在雲端備份 meta 文件新增寫入欄位：

```js
 touchedQuestionCount
```

但 `firestore.rules` 的 `validMetaWrite()` 沒有允許這個欄位。因此最後寫入：

```txt
apps/med-exam-app/users/{uid}/sync/meta
```

時會被 Firestore 拒絕，前端再把 `Missing or insufficient permissions` 包裝成同步權限未開通訊息。

這是 v055 程式與 Rules 欄位白名單不一致造成，不是使用者登入或 allowlist 設定錯誤。

## 修復
為了兼容目前已部署的 Firestore Rules，v056 改為：

- 上傳 `sync/meta` 時不再寫入 `touchedQuestionCount`。
- `answeredCount`、checksum、chunkCount、payloadBytes 等核心欄位保持不變。
- UI 仍可讀取舊雲端 meta 中若已存在的 `touchedQuestionCount`，但新上傳不依賴它。
- 保留 v055 的合併邏輯與方劑精靈文字修正。

## 影響
- 不需要因這個 bug 重新修改 Firestore Rules。
- 若你之後想在雲端 meta 顯示「已記錄題數」，可以再同步更新 Rules 白名單；但為了穩定，這版先用最小修復避免上傳被擋。

## 驗證
已執行：

```bash
node --check admin.js
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
node --check service-worker.js
node --check firebase-ui.js
node --check firebase-backup.js
node --check memory-bridge.js
python3 tests/question_bank_check.py
```

結果：

```txt
med_question_count = 813
errors = 0
ok
cloud_meta_rules_compat_check_v056 ok
```
