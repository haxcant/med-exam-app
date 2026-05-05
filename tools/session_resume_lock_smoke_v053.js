#!/usr/bin/env node
'use strict';

function repairAnsweredCursorIfNeeded(session) {
  if (!session || !Array.isArray(session.queue)) return false;
  if (!session.answeredMap || typeof session.answeredMap !== 'object') session.answeredMap = {};
  let moved = 0;
  while (session.index < session.queue.length && Object.prototype.hasOwnProperty.call(session.answeredMap, session.queue[session.index])) {
    session.index += 1;
    moved += 1;
  }
  if (!moved) return false;
  session.flashRevealed = false;
  session.resumeRepairNotice = moved === 1
    ? '偵測到上次已作答但尚未切到下一題，已自動接續到下一題。'
    : `偵測到上次已有 ${moved} 題完成但尚未切題，已自動接續。`;
  return true;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const interruptedAfterFeedback = {
  queue: ['Q1', 'Q2', 'Q3'],
  index: 0,
  answeredMap: { Q1: { isCorrect: true } },
  flashRevealed: true,
};
assert(repairAnsweredCursorIfNeeded(interruptedAfterFeedback) === true, 'should repair answered current question');
assert(interruptedAfterFeedback.index === 1, 'should advance to next unanswered question');
assert(interruptedAfterFeedback.flashRevealed === false, 'should clear transient flashcard reveal state');
assert(/已自動接續/.test(interruptedAfterFeedback.resumeRepairNotice), 'should set user notice');

const multipleAnswered = {
  queue: ['Q1', 'Q2', 'Q3'],
  index: 0,
  answeredMap: { Q1: {}, Q2: {} },
};
assert(repairAnsweredCursorIfNeeded(multipleAnswered) === true, 'should repair multiple answered records');
assert(multipleAnswered.index === 2, 'should advance over all answered records');

const lastQuestionAnswered = {
  queue: ['Q1'],
  index: 0,
  answeredMap: { Q1: {} },
};
assert(repairAnsweredCursorIfNeeded(lastQuestionAnswered) === true, 'should repair last answered question');
assert(lastQuestionAnswered.index === 1, 'last answered question should reach summary boundary');

const notAnsweredYet = {
  queue: ['Q1', 'Q2'],
  index: 0,
  answeredMap: {},
};
assert(repairAnsweredCursorIfNeeded(notAnsweredYet) === false, 'unanswered current question should not move');
assert(notAnsweredYet.index === 0, 'unanswered index should remain unchanged');

console.log('session_resume_lock_smoke_v053 ok');
