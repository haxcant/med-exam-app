# GitHub Desktop 看不到醫學專案時怎麼做

GitHub Desktop 不會自動掃描你電腦上的所有資料夾。你要手動把本地專案資料夾加入 GitHub Desktop。

## 情況 A：你已經用命令列 git init / commit 過

1. 打開 GitHub Desktop。
2. 選 `File → Add local repository...`。
3. 點 `Choose...`。
4. 選到你解壓後的專案根目錄，例如：

```text
D:\projects\med-exam-app
```

注意要選含有 `index.html`、`app.js`、`firebase-ui.js` 的那一層，不要選外層下載資料夾。

5. 按 `Add Repository`。
6. 若還沒推到 GitHub，按 `Publish repository`。

## 情況 B：GitHub Desktop 說這不是 Git repository

代表那個資料夾還沒有 `.git`。

做法一：用 GitHub Desktop 建立：

1. `File → Add local repository...`
2. 選 `med-exam-app` 資料夾。
3. 如果出現「This directory does not appear to be a Git repository」，選擇 `create a repository`。
4. Repository name 用：`med-exam-app`。
5. 建立後 Commit。
6. 按 `Publish repository`。

做法二：用 PowerShell 建立：

```powershell
cd 路徑\到\med-exam-app
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git branch -M main
git add .
git commit -m "Initialize med-exam-app v0.1.2 access review flow"
```

然後回 GitHub Desktop：

```text
File → Add local repository... → Choose med-exam-app → Add Repository
```

## 情況 C：GitHub Desktop 加到的是舊駕訓班專案

檢查左上角 repository 名稱。如果不是 `med-exam-app`：

1. `File → Add local repository...`
2. 重新選醫學專案的資料夾。
3. 不要選 `driver-quiz-mobile-202604` 或舊專案資料夾。

## 建議第一次推送

如果是新的 GitHub repo：

1. GitHub Desktop 右上角按 `Publish repository`。
2. Name：`med-exam-app`。
3. Visibility：Public。
4. 不要勾 private，除非你確定 GitHub Pages 權限方案可用。
5. Publish。

如果你已經在 GitHub 網頁建立 repo，也可以用命令列：

```powershell
git remote add origin https://github.com/<你的GitHub帳號>/med-exam-app.git
git push -u origin main
```
