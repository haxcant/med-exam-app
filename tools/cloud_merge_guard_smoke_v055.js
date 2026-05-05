const fs = require('fs');
const vm = require('vm');

const store = new Map();
const localStorage = {
  getItem: (k) => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const listeners = {};
const document = {
  readyState: 'complete',
  visibilityState: 'visible',
  body: { classList: { contains: () => false } },
  addEventListener: (name, fn) => { listeners[name] = fn; },
  getElementById: () => null,
  createElement: () => ({ click(){}, set href(v){ this._href=v; }, get href(){ return this._href; } }),
};
const window = {
  document,
  localStorage,
  addEventListener: (name, fn) => { listeners[name] = fn; },
  DriverQuizMemory: {},
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  setTimeout: (fn) => { if (typeof fn === 'function') fn(); },
  Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
};
const context = { window, document, localStorage, console, URL: window.URL, Blob: window.Blob, setTimeout: window.setTimeout };
vm.createContext(context);
vm.runInContext(fs.readFileSync('memory-bridge.js', 'utf8'), context, { filename: 'memory-bridge.js' });

const STORAGE_KEY = 'med-exam-progress-v1';
function setProgress(progress){ localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
function getProgress(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)); }

setProgress({
  byQuestion: {
    Q1: { totalSeen: 29, totalCorrect: 0, totalWrong: 29, score: -1, inWrongBook: true, lastWrongAt: '2026-05-01T00:00:00.000Z', lastSeenAt: '2026-05-01T00:00:00.000Z' },
    Q2: { totalSeen: 3, totalCorrect: 3, totalWrong: 0, score: 1, inWrongBook: false, lastSeenAt: '2026-05-02T00:00:00.000Z' },
  },
  meta: { totalAnswered: 32, totalCorrect: 3, bestStreak: 1, totalCompletedSessions: 1 },
});

const cloudPayload = {
  progress: {
    byQuestion: {
      Q1: { totalSeen: 44, totalCorrect: 44, totalWrong: 0, score: 1, inWrongBook: false, lastSeenAt: '2026-05-03T00:00:00.000Z' },
      Q3: { totalSeen: 5, totalCorrect: 4, totalWrong: 1, score: 1, inWrongBook: false, lastSeenAt: '2026-05-04T00:00:00.000Z' },
    },
    meta: { totalAnswered: 49, totalCorrect: 48, bestStreak: 2, totalCompletedSessions: 2 },
  },
};

const api = window.DriverQuizMemoryBridge.ensureMemoryApi();
api.applyPayload(cloudPayload, { mode: 'conservative', sourceChecksum: 'cloud-abc' });
const merged = getProgress();
function assert(cond, msg){ if (!cond) throw new Error(msg); }
assert(merged.byQuestion.Q1.totalSeen === 44, 'same question totalSeen must not regress');
assert(merged.byQuestion.Q1.totalWrong === 29, 'same question wrong count must preserve local weakness');
assert(merged.byQuestion.Q1.inWrongBook === true, 'wrong book state must be preserved');
assert(merged.byQuestion.Q3.totalSeen === 5, 'new cloud question must be included');
assert(merged.meta.totalAnswered === 52, 'meta totalAnswered should be recomputed from merged records');
assert(Array.isArray(merged.meta.mergedCloudChecksums) && merged.meta.mergedCloudChecksums.includes('cloud-abc'), 'merged cloud checksum must be recorded');
console.log('cloud_merge_guard_smoke_v055 ok');
