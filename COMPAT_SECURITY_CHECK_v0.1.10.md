# v0.1.10 相容性與資安檢查報告

檢查來源：使用者上傳的 `med-exam-app04252.zip`，並比對前幾輪修改方向。

## 檢查結果

### 已確認正常保留

- 錯題本列印版已不再顯示「最近錯答：未保存」。沒有最近錯答摘要時會省略欄位。
- 錯題本列印版標題有說明舊資料或匯入檔可能不顯示最近錯答。
- 本機學習記憶仍是每題一格的聚合資料，不保存完整答題歷史。
- 雲端備份已保留最近錯答摘要欄位：`lastResult`、`lastSelectedValue`、`lastSelectedLabel`、`lastWrongSelectedValue`、`lastWrongSelectedLabel`。
- Firestore Rules 已限制正式備份路徑、chunk 數量與欄位格式。
- 測試寫入已改到 `diagnostics/smoke`，不污染正式 `sync/meta`。
- 管理者模型已改為 `admins/{uid}`。

### 發現並修正的衝突

1. `admin.js` 仍有舊提示文字，提到 `app_config/global.adminUids`。已改為 `admins/{UID}`。
2. `index.html`、`admin.html`、`firebase-ui.js`、`service-worker.js` 的 cache-busting 版本字串不一致，可能造成 PWA/Service Worker 混載舊模組。已統一為 `20260425med020`。
3. 使用者上傳的 zip 中未找到 `firebase-init.js`，但 `index.html`、`firebase-ui.js`、`firebase-debug.html`、`admin.js` 都需要它。已將目前正確 Firebase modular 版 `firebase-init.js` 補入 patch。
4. `firebase-access.js` 的全域設定摘要仍以 `adminUids` 命名。已改成 `adminModel: "admins_collection"`，避免誤導。

## 建議 Firestore Data 狀態

`app_config/global` 保留：

```text
appId: "med-exam-app"
syncEnabled: true
note: "global sync switch"
```

`admins/{你的UID}`：

```text
enabled: true
email: "你的信箱"
role: "owner"
```

建議移除 `app_config/global.adminUids`，因為 v0.1.10 不再使用它。
