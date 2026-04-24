# v0.1.2 access-review-flow

## Added

- 新增 `firebase-access.js`：使用者可自行送出同步權限申請。
- 新增 `admin.html` / `admin.js`：管理者可審核申請、核准後自動寫入 `allowlist/{uid}`。
- 新增 `firestore.rules`：支援 access_requests + allowlist + 醫學題庫同步資料路徑。
- 新增 `FIREBASE_ACCESS_REVIEW_SETUP.md`：Cloud Firestore 逐步設定說明。
- 新增 `GITHUB_DESKTOP_SETUP.md`：GitHub Desktop 看不到本地專案時的處理流程。

## Changed

- `firebase-ui.js`：登入後先檢查 allowlist；未核准時顯示「申請同步權限」按鈕，並禁用雲端上傳／下載。
- `firebase-backup.js`：permission denied 訊息改成申請核准流程，不再提 `app_config/global.syncEnabled`。
- `service-worker.js`：cache name 更新為 `med-exam-app-v0.1.2`，並快取 admin / access 檔案。

## Notes

- `YOUR_ADMIN_UID` 必須在 Firebase Rules 中換成你的真實 Firebase Authentication UID。
- 不再需要手動為每位使用者建立 `allowlist/{uid}`；只需要管理者到 `admin.html` 按核准。
