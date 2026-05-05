#!/usr/bin/env node
'use strict';

function isStoredSessionIncomplete(data) {
  if (!data || !Array.isArray(data.queue) || !data.queue.length) return false;
  const queueLen = data.queue.length;
  const index = Number(data.index || 0);
  if (!Number.isFinite(index)) return true;
  return index < queueLen;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(isStoredSessionIncomplete({ queue: ['Q1', 'Q2'], index: 0 }) === true, 'newly started session should be incomplete');
assert(isStoredSessionIncomplete({ queue: ['Q1', 'Q2'], index: 1, answeredMap: { Q1: {} } }) === true, 'partially completed session should be incomplete');
assert(isStoredSessionIncomplete({ queue: ['Q1', 'Q2'], index: 2, answeredMap: { Q1: {}, Q2: {} } }) === false, 'summary-boundary session should not be treated as incomplete');
assert(isStoredSessionIncomplete({ queue: [], index: 0 }) === false, 'empty/stale queue is handled by validation, not this discard gate');
assert(isStoredSessionIncomplete({ queue: ['Q1'], index: 'not-a-number' }) === true, 'invalid index should be safely discarded');

const appJs = require('fs').readFileSync('app.js', 'utf8');
assert(appJs.includes('SESSION_DISCARD_NOTICE_KEY'), 'app should define discard notice key');
assert(appJs.includes('function discardCurrentIncompleteSession'), 'app should discard current incomplete sessions');
assert(appJs.includes('window.addEventListener("pagehide"'), 'app should discard on pagehide / close navigation');
assert(appJs.includes('已自動退出上次未完成的題組'), 'app should show a clear user notice');

console.log('session_discard_incomplete_smoke_v054 ok');
