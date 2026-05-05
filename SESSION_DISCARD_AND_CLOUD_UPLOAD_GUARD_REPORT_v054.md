# v054 未完成題組自動退出與雲端上傳防誤覆蓋修復報告

## 修正目標

本版針對兩個使用風險進行修正：

1. 使用者上一場練習未正常完成就關閉瀏覽器，下次開啟可能因 session / timer / answeredMap 狀態不同步而卡住。
2. 使用者手動上傳雲端時，如果本機資料量少於雲端，可能誤把較少的本機記憶覆蓋到雲端，造成雲端部分記憶遺失。

## 主要改動

### 1. 未完成題組不再恢復

修改檔案：`app.js`

新增／調整邏輯：

- 啟動時讀取 `med-exam-session-v1`。
- 若偵測到 session 仍停在未完成題組，也就是 `session.index < session.queue.length`：
  - 自動刪除暫時 session。
  - 回到主畫面。
  - 顯示提示：已自動退出上次未完成題組。
- 不刪除正式作答進度、錯題本、積分、lastSeen、lastWrong 或 Firebase 記憶。

此修法等於：

```txt
未完成的當前題組 = 暫時狀態，可丟棄
已寫入的作答記憶 = 正式記錄，保留
```

### 2. 關閉／離開頁面時也清掉未完成題組

修改檔案：`app.js`

新增事件：

- `pagehide`
- `beforeunload`
- `pageshow` bfcache 回復檢查

目的：降低 Safari / iOS WebView 把舊頁面從 bfcache 恢復後仍停在半殘練習畫面的機率。

### 3. 雲端上傳前檢查本機與雲端資料量

修改檔案：`firebase-ui.js`

手動按「上傳雲端」時，系統會先讀取雲端 meta，並比較：

- 雲端 `answeredCount`
- 本機 `answeredCount`

如果：

```txt
本機作答數 < 雲端作答數
```

會跳出確認框，提示：

- 偵測到本機資料量少於雲端備份。
- 若現在上傳，可能會用較少的本機資料覆蓋雲端。
- 建議先下載雲端並選擇合併。

使用者按取消時，不會上傳。

### 4. 自動上傳遇到本機資料少於雲端時直接暫停

修改檔案：`firebase-ui.js`

自動上傳沒有互動確認框，因此若本機資料少於雲端，會直接暫停自動上傳並顯示狀態，避免在背景誤覆蓋雲端。

## 版本與快取

已更新：

- `index.html` query string：`20260505v054`
- `service-worker.js` cache name：`med-exam-app-v0.1.54-discard-session-cloud-guard`
- `versionSummary`：v0.1.54 未完成題組自動退出＋雲端覆蓋確認

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
python3 tests/question_bank_check.py
node tools/session_discard_incomplete_smoke_v054.js
node tools/cloud_upload_guard_smoke_v054.js
```

結果：

```txt
med_question_count = 813
errors = 0
ok
session_discard_incomplete_smoke_v054 ok
cloud_upload_guard_smoke_v054 ok
```

## 注意

本版不會自動合併雲端資料；只是避免使用者不小心用較少的本機資料覆蓋較多的雲端資料。若需要真正合併，仍應使用「下載雲端記憶到本機」並在第二步選擇合併。
