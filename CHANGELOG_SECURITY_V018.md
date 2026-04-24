# v0.1.8

- 強化 Firestore Security Rules，限制雲端備份 metadata、chunk、申請、白名單的欄位與型別。
- 限制 sync_chunks 只能使用 chunk_0000 到 chunk_0009，避免被核准使用者建立任意大量 chunk 文件。
- 將 smoke test 改寫到 diagnostics/smoke，避免污染正式 sync/meta。
- 新增 admins/{uid} 私密管理者模式，並保留 app_config/global.adminUids 相容。
- 正式上傳 metadata 改為覆蓋寫入，移除舊測試欄位或非預期欄位。
- bump service worker cache 到 med-exam-app-v0.1.8。
