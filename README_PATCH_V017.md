# v0.1.7 patch：隱藏舊錯題缺少最近錯答欄位

覆蓋檔案：

```text
app.js
service-worker.js
CHANGELOG.md
```

不要覆蓋 `firebase-init.js`。

修正內容：

- 錯題本列印版不再顯示「最近錯答：未保存」。
- 若舊錯題或匯入檔沒有最近錯答摘要，直接省略該欄位。
- 列印版標題區加入小字說明：舊版錯題或匯入檔可能不顯示最近錯答選項。
- 匯入錯題檢視頁也同步省略缺少最近錯答摘要的欄位。
- Service Worker cache bump 至 `med-exam-app-v0.1.7`。

部署後請清除 PWA 快取，再用 `?v=017` 測試。
