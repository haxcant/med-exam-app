# v0.1.8 security hardening patch

本 patch 目標：不改主要使用體驗，但把 Firestore 後端規則收緊，避免被核准使用者繞過前端直接寫入任意大量文件或污染資料格式。

## 覆蓋檔案

```text
firestore.rules
firebase-access.js
firebase-backup.js
firebase-sync-smoke.js
firebase-ui.js
admin.html
service-worker.js
```

不要覆蓋 `firebase-init.js`，以免蓋掉你目前的新 Firebase config。

## 主要修改

1. Firestore Rules 強化：
   - sync_chunks 只允許 `chunk_0000` 到 `chunk_0009`。
   - chunk 欄位只允許 `index/checksum/data`。
   - chunk data 長度上限 120000 字元。
   - sync/meta 欄位白名單與型別限制。
   - access_requests 欄位白名單與訊息長度限制。
   - allowlist 欄位白名單與型別限制。
   - 新增 `admins/{uid}` 私密管理者路徑，並保留舊 `app_config/global.adminUids` 相容。
   - smoke test 改寫到 `apps/med-exam-app/users/{uid}/diagnostics/smoke`，不再污染 `sync/meta`。

2. 前端配合：
   - `firebase-sync-smoke.js` 改到 diagnostics/smoke。
   - `firebase-backup.js` 上傳 meta 改成覆蓋寫入，清掉舊測試欄位或非預期欄位。
   - `firebase-access.js` 申請文件改成覆蓋寫入並截斷 email/displayName/photoURL 長度。
   - bump Firebase module query string 到 `20260424med018`。
   - service worker cache bump 到 `med-exam-app-v0.1.8`。

## 建議 Firestore 設定

保留：

```text
app_config/global
  appId: "med-exam-app"
  syncEnabled: true
  note: "global sync switch"
```

建議新增：

```text
admins/{你的UID}
  enabled: true
  email: "你的信箱"
  role: "owner"
```

舊的 `app_config/global.adminUids` 仍可用；但若你已建立 `admins/{uid}`，可考慮移除 `adminUids`，避免一般登入者讀取 app_config/global 時看到管理者 UID 清單。

## 上 Git

```powershell
cd 路徑\到\med-exam-app

git status
git add firestore.rules firebase-access.js firebase-backup.js firebase-sync-smoke.js firebase-ui.js admin.html service-worker.js
git commit -m "Harden Firestore sync rules and diagnostics path"
git push
```

## Firebase Rules

到 Firebase Console → Firestore Database → Rules，貼上本 patch 的 `firestore.rules`，按 Publish。

## 部署後測試

1. 清 PWA 快取：Application → Service Workers → Unregister；Storage → Clear site data。
2. 開 `firebase-debug.html?v=018`，確認 projectId 正確。
3. 開 `admin.html?v=018`，確認可登入管理者帳號並讀取申請列表。
4. 主頁按「測試雲端寫入／讀取」，確認會寫到 diagnostics/smoke，不再寫到 sync/meta。
5. 上傳雲端備份，確認 Firestore 仍產生：

```text
apps/med-exam-app/users/{uid}/sync/meta
apps/med-exam-app/users/{uid}/sync_chunks/chunk_0000
```

## 注意

如果你以前用「測試雲端寫入」在 `sync/meta` 留過 `testValue`，本版 `firebase-backup.js` 會在下次正式上傳時用覆蓋寫入清掉它。
