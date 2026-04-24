# Firebase 設定：v0.1.3 正確版

本版修正重點：

1. 前端使用 Firebase **modular SDK**，不可再在 `index.html` 加入 `firebase-app-compat.js`、`firebase-auth-compat.js`、`firebase-firestore-compat.js`。
2. 主頁與 admin 頁都透過 `firebase-init.js` 匯入 `auth`、`db`。
3. 管理者不再寫死在 Rules 的 `YOUR_ADMIN_UID`，改由 Firestore 文件 `app_config/global.adminUids` 控制。
4. 使用者可自行送出 `access_requests/{uid}`，管理者在 `admin.html` 核准後自動建立 `allowlist/{uid}`。

---

## 1. 確認 Firebase Web App config

打開 `firebase-init.js`，確認這裡是不是你要使用的 Firebase project：

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

如果你已建立新的 Firebase project，請到：

```text
Firebase Console → Project settings → Your apps → Web app
```

複製新的 firebaseConfig，替換 `firebase-init.js` 內的舊設定。

---

## 2. 啟用 Google 登入

```text
Firebase Console → Authentication → 登入方式 → Google → 啟用
```

Authorized domains 至少要有：

```text
localhost
你的GitHub帳號.github.io
```

只填網域，不要加 `/med-exam-app/`。

---

## 3. 發布 Firestore Rules

到：

```text
Firebase Console → Firestore Database → Rules
```

貼上本專案的 `firestore.rules`，然後 Publish。

---

## 4. 建立 / 修改 `app_config/global`

到：

```text
Firestore Database → Data
```

建立：

```text
Collection ID: app_config
Document ID: global
```

欄位：

| 欄位 | Type | Value |
|---|---|---|
| `appId` | string | `med-exam-app` |
| `syncEnabled` | boolean | `true` |
| `note` | string | `global sync switch` |
| `adminUids` | array | 先空陣列或稍後加入你的 UID |

`syncEnabled` 必須是 **Boolean true**，不是字串 `"true"`。

---

## 5. 取得你的 UID

打開：

```text
https://你的GitHub帳號.github.io/med-exam-app/firebase-debug.html
```

或本地：

```text
http://localhost:8000/firebase-debug.html
```

登入 Google 後，頁面會顯示：

```json
{
  "projectId": "...",
  "uid": "你的 Firebase Authentication UID",
  "email": "..."
}
```

把 `uid` 複製起來。

---

## 6. 把 UID 加入 `app_config/global.adminUids`

回到 Firestore：

```text
app_config → global → adminUids
```

將 `adminUids` 設為 array，例如：

```text
adminUids: ["你的UID"]
```

完成後打開：

```text
https://你的GitHub帳號.github.io/med-exam-app/admin.html
```

登入同一個 Google 帳號，就可以看到申請列表。

---

## 7. 使用者申請與核准流程

使用者：

```text
主頁 → Google 登入 → 申請同步權限
```

Firestore 會建立：

```text
access_requests/{使用者UID}
```

管理者：

```text
admin.html → 核准
```

系統會自動建立：

```text
allowlist/{使用者UID}
```

核准後，使用者重新整理主頁，即可使用上傳 / 下載雲端備份。

---

## 8. 若頁面曾被舊 service worker 快取

部署後請先清快取：

```text
F12 → Application → Service Workers → Unregister
F12 → Application → Storage → Clear site data
```

再打開：

```text
https://你的GitHub帳號.github.io/med-exam-app/index.html?v=013
```

---

## 9. Console 檢查方式

本專案是 modular SDK，所以不要用：

```js
firebase.app().options.projectId
```

要用：

```js
MedExamFirebase.app.options.projectId
MedExamFirebase.auth.currentUser?.uid
```

或直接開 `firebase-debug.html`。
