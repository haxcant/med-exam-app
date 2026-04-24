# v0.1.9 Admin Tightening + Last Wrong Choice Cloud Sync Patch

## 覆蓋檔案

覆蓋這些檔案：

- firestore.rules
- firebase-backup.js
- firebase-access.js
- firebase-ui.js
- firebase-debug.html
- admin.html
- service-worker.js

不要覆蓋：

- firebase-init.js

## Firestore 網頁端要做

1. 到 Firebase Console → Firestore Database → Rules。
2. 整份貼上本 patch 的 `firestore.rules`，按 Publish。
3. 確認已建立：

```text
admins/{你的 Firebase UID}
  enabled: true
  email: "你的 email"
  role: "owner"
```

4. 確認 `app_config/global` 保留：

```text
appId: "med-exam-app"
syncEnabled: true
note: "global sync switch"
```

5. 建議刪除 `app_config/global` 裡的 `adminUids` 欄位。v0.1.9 rules 不再使用 adminUids。

## 本版重點

- Admin 權限只看 `admins/{uid}.enabled == true`。
- `app_config/global.adminUids` 不再用，避免登入使用者讀到管理者 UID 清單。
- 雲端備份保留每題最近錯答摘要欄位：
  - `lastResult`
  - `lastSelectedValue`
  - `lastSelectedLabel`
  - `lastWrongSelectedValue`
  - `lastWrongSelectedLabel`
- 仍然不保存完整答題歷史，因此資料量不會因為反覆練習同一題而持續膨脹。

## 測試

1. 開 `/firebase-debug.html?v=019` 檢查 projectId、uid。
2. 開 `/admin.html?v=019` 確認管理者可讀取列表。
3. 主頁故意答錯一題，上傳雲端。
4. Firestore 的 `sync_chunks/chunk_0000.data` 裡，對應題目應可看到 `lastWrongSelectedLabel`。
5. 下載雲端到本機後，錯題本列印版若該題有最近錯答，應能顯示該選項。
