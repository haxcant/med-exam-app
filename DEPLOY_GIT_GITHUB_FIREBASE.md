# 部署與 Firebase 分家指示（med-exam-app v0.1.1）

## 一、這版已做的 Firebase 對應修改

`firebase-backup.js` 已使用獨立 namespace：

```js
const APP_NAMESPACE = "med-exam-app";
const APP_ID = "med-exam-pwa";
```

Firestore 路徑會寫到：

```text
apps/med-exam-app/users/{uid}/sync/meta
apps/med-exam-app/users/{uid}/sync_chunks/chunk_0000
```

不再使用舊駕訓班的：

```text
users/{uid}/sync/...
users/{uid}/sync_chunks/...
```

因此可以暫時共用同一個 Firebase project，但資料路徑已和駕訓班專案分開。

## 二、第一次建立新的 Git repo

請在解壓後的 `med-exam-app` 資料夾內執行：

```powershell
cd 路徑\到\med-exam-app

Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

git init
git branch -M main
git status

git add .
git commit -m "Initialize med-exam-app v0.1.1 scaffold"
```

## 三、建立 GitHub repo 並上傳

在 GitHub 建立新 repository，名稱建議：

```text
med-exam-app
```

不要勾選 fork，不要用舊 repo。建立後執行：

```powershell
git remote add origin https://github.com/<你的GitHub帳號>/med-exam-app.git
git push -u origin main
```

如果你已經先建立 remote，但網址錯了：

```powershell
git remote -v
git remote set-url origin https://github.com/<你的GitHub帳號>/med-exam-app.git
git push -u origin main
```

## 四、GitHub Pages 設定

到 GitHub repo：

```text
Settings → Pages
```

設定：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

預期網址：

```text
https://<你的GitHub帳號>.github.io/med-exam-app/
```

## 五、部署後必要檢查

打開網站後，用 DevTools Console / Application 檢查：

```text
1. Console 沒有 404 或 Firebase 錯誤
2. Application → Local Storage 看到 med-exam-*，不是 driver-quiz-*
3. Application → Service Workers 顯示 med-exam-app-v0.1.1
4. 題庫載入 med_questions.js
5. 首頁看不到路考模擬區塊
6. 登入 Firebase 後，上傳備份不會寫到舊 users/{uid}/sync 路徑
```

## 六、Firestore Security Rules 參考

如果目前 Firebase rules 已允許登入使用者讀寫自己的資料，通常不用改。
若需要針對新路徑補規則，可參考：

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /apps/med-exam-app/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

若同一 Firebase project 仍要保留舊駕訓班路徑，請不要刪掉舊規則，只要新增上面這段。
