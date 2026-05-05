#!/usr/bin/env node
const fs = require('fs');
const src = fs.readFileSync('firebase-ui.js', 'utf8');
const required = [
  'localDataIsSmallerThanCloud',
  'buildCloudOverwriteWarning',
  '偵測到本機資料量少於雲端備份',
  'window.confirm(buildCloudOverwriteWarning())',
  '已暫停自動上傳，避免覆蓋雲端記憶',
];
const missing = required.filter((needle) => !src.includes(needle));
if (missing.length) {
  console.error('cloud_upload_guard_smoke_v054 failed, missing:', missing);
  process.exit(1);
}
console.log('cloud_upload_guard_smoke_v054 ok');
