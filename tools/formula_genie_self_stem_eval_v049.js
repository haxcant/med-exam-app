#!/usr/bin/env node
// v049 self-stem regression test for Formula Genie.
// Checks whether each in-project question can route back to its own answer.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ctx = {
  window: {},
  document: {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    head: { appendChild() {} },
  },
  console,
};
vm.createContext(ctx);
for (const file of ['formula_genie_data.js', 'med_questions.js', 'formula_genie_matcher.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
}

const matcher = ctx.window.FormulaGenieMatcher;
const questions = ctx.window.MED_QUESTION_BANK || [];

function optionText(q) {
  const opts = Array.isArray(q.options) ? q.options : [];
  if (!opts.length) return '';
  return opts.map((o, i) => `${i + 1}. ${typeof o === 'string' ? o : (o?.text || o?.label || '')}`).join(' ');
}

function runCase(useOptions) {
  let top1 = 0;
  let contains = 0;
  let selfExact = 0;
  let ambiguous = 0;
  const bad = [];
  const byCategory = {};
  for (const q of questions) {
    const input = (q.prompt || '') + (useOptions && optionText(q) ? ' ' + optionText(q) : '');
    const res = matcher.directMatch(input, 20);
    const labels = (res.formulas || []).map(x => x.label);
    byCategory[q.category] ||= { n: 0, top1: 0, contains: 0 };
    byCategory[q.category].n += 1;
    if (labels[0] === q.answer) {
      top1 += 1;
      byCategory[q.category].top1 += 1;
    }
    if (labels.includes(q.answer)) {
      contains += 1;
      byCategory[q.category].contains += 1;
    } else {
      bad.push({ id: q.id, category: q.category, answer: q.answer, top5: labels.slice(0, 5), intent: res.intent || {} });
    }
    if (res.intent?.selfStemExact) selfExact += 1;
    if (res.intent?.selfStemAmbiguous) ambiguous += 1;
  }
  return {
    mode: useOptions ? 'prompt_with_options' : 'prompt_only',
    n: questions.length,
    top1,
    top1Accuracy: top1 / questions.length,
    contains,
    containsAccuracy: contains / questions.length,
    selfExact,
    ambiguous,
    byCategory,
    bad: bad.slice(0, 50),
  };
}

const result = {
  generatedAt: new Date().toISOString(),
  results: [runCase(false), runCase(true)],
};
console.log(JSON.stringify(result, null, 2));
if (result.results[1].top1 !== questions.length) {
  process.exitCode = 1;
}
