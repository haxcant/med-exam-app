# v053 中斷作答後重開卡住修復報告

## 問題定位

使用者若在「已作答並顯示回饋」後，尚未按下一題或等待自動跳題前關閉瀏覽器，`localStorage` 會保留：

- `session.index`：仍停在該題
- `session.answeredMap[currentQuestionId]`：該題已作答

重新開啟後，舊版會重新渲染同一題的未作答畫面，但 `handleAnswer()` 看到 `answeredMap` 已存在會直接 return，導致選項按了沒有反應，看起來像卡死。使用者只能清 cookie / 清 localStorage 才能恢復。

## 修復內容

### 1. 自動修復已作答但未切題的游標

新增：

- `isQuestionAlreadyAnsweredInSession(questionId)`
- `repairAnsweredCursorIfNeeded(reason)`

在 `validateAndNormalizeSession()` 中自動檢查：

```text
如果 session.queue[session.index] 已經在 answeredMap 中
→ 自動將 index 往後推到下一個尚未作答題
→ 若已是最後一題，直接進入結算頁
```

### 2. 顯示修復提示但不刪進度

新增：

- `buildAndConsumeSessionNoticeHtml()`

當偵測到中斷續答修復時，下一題畫面會顯示：

```text
偵測到上次已作答但尚未切到下一題，已自動接續到下一題。
```

此流程只清除暫存題組卡點，不會刪除完整作答進度。

### 3. 避免完成頁重複累加完成次數

如果最後一題已答完但還沒進入 summary 就關閉，重開後會進入結算頁。舊版可能每次重開都重複累加 `totalCompletedSessions`。

新增：

- `session.summaryRecorded`

讓同一個 session 的完成次數只記錄一次。

### 4. 更新版本與快取

- `app.js` version summary 更新為 `v0.1.53`
- `index.html` / `index_fixed.html` query string 更新為 `20260505v053`
- `service-worker.js` cache name 更新為 `med-exam-app-v0.1.53-resume-lock-fix`

## 驗證

已執行：

```bash
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
node --check service-worker.js
node --check admin.js
python3 tests/question_bank_check.py
node tools/session_resume_lock_smoke_v053.js
```

結果：

```text
med_question_count = 813
errors = 0
ok
session_resume_lock_smoke_v053 ok
```

## 預期改善

修復後，使用者在以下情境不需要再清 cookie：

1. 作答後停在答題回饋頁。
2. 尚未按「下一題」。
3. 尚未等到自動跳題。
4. 直接關閉瀏覽器或 Safari 被系統回收。
5. 下次重新打開網站。

系統會自動跳過已作答但未切題的卡點，接續到下一題或結算頁。
