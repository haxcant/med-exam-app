# Firebase 白名單申請／審核流程設定

此版本改成：使用者登入後可自行送出同步權限申請；管理者到 `admin.html` 核准後，系統自動建立 `allowlist/{uid}`，使用者才可使用雲端上傳／下載。

## 1. 取得管理者 UID

1. 到 Firebase Console。
2. 進入你的 Firebase project。
3. 到 `Build → Authentication → Users`。
4. 找到你自己的 Google 帳號。
5. 複製 `User UID`。

## 2. 更新 Firestore Rules

1. 到 `Build → Firestore Database → Rules`。
2. 先備份原本 Rules。
3. 貼上專案內 `firestore.rules` 的內容。
4. 將：

```js
request.auth.uid == "YOUR_ADMIN_UID"
```

改成你的真實 UID，例如：

```js
request.auth.uid == "abc123..."
```

5. 按 `Publish`。

## 3. 不需要手動建立 allowlist

使用者在網站登入後按「申請同步權限」，Firestore 會自動建立：

```text
access_requests/{使用者UID}
```

你進入：

```text
https://你的帳號.github.io/med-exam-app/admin.html
```

登入管理者帳號後，按「核准」，系統會自動建立：

```text
allowlist/{使用者UID}
```

核准後該使用者才可讀寫：

```text
apps/med-exam-app/users/{使用者UID}/sync/meta
apps/med-exam-app/users/{使用者UID}/sync_chunks/chunk_0000
```

## 4. Firestore Database Data 頁面會看到的結構

```text
access_requests
└─ 使用者UID
   ├─ uid: "使用者UID"
   ├─ email: "user@example.com"
   ├─ displayName: "使用者名稱"
   ├─ appId: "med-exam-app"
   ├─ status: "pending" | "approved" | "rejected"
   ├─ requestedAt: timestamp
   └─ updatedAt: timestamp

allowlist
└─ 使用者UID
   ├─ enabled: true
   ├─ email: "user@example.com"
   ├─ role: "user"
   ├─ approvedAt: timestamp
   └─ approvedBy: "管理者UID"

apps
└─ med-exam-app
   └─ users
      └─ 使用者UID
         ├─ sync
         │  └─ meta
         └─ sync_chunks
            └─ chunk_0000
```

`apps/.../sync/...` 不需要手動建立。使用者被核准後第一次上傳時會自動建立。

## 5. 測試流程

1. 使用一般使用者帳號登入主頁 `index.html`。
2. 按「申請同步權限」。
3. 到 Firestore 確認 `access_requests/{uid}` 已出現。
4. 用管理者帳號打開 `admin.html`。
5. 按「核准」。
6. 回到主頁重新整理或重新登入。
7. 確認「上傳雲端備份」與「下載雲端備份」按鈕可用。
8. 上傳後到 Firestore 檢查 `apps/med-exam-app/users/{uid}/...` 是否建立。
