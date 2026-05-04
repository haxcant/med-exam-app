#!/usr/bin/env node
/* v050 generalization/demo evaluation for Formula Genie.
   It evaluates non-identical, paraphrased or diagnostic-style inputs so the demo can show
   the algorithm is not only memorizing its own stems. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ctx = {
  window: {},
  document: { readyState: 'loading', addEventListener() {}, getElementById() { return null; }, head: { appendChild() {} } },
  console,
};
vm.createContext(ctx);
for (const file of ['formula_genie_data.js', 'med_questions.js', 'formula_genie_matcher.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
}
const D = ctx.window.FORMULA_VECTOR_WEIGHTS_V015;
const matcher = ctx.window.FormulaGenieMatcher;
const rows = D.oracleTrainingRowsV015 || [];

function norm(s) { return String(s || '').replace(/[\s，。；、,.;:：]+/g, ''); }
function naiveTokenize(input) {
  const t = String(input || '').replace(/[，。；、,.;:：]+/g, ' ');
  return t.split(/\s+/).map(x => x.trim()).filter(x => x.length >= 2);
}
function naiveBaseline(input, limit = 8) {
  const toks = naiveTokenize(input);
  const scored = rows.map(r => {
    const text = norm(`${r.prompt || ''} ${Object.keys(r.features || {}).join(' ')}`);
    let score = 0;
    for (const tok of toks) if (text.includes(norm(tok))) score += tok.length >= 4 ? 2 : 1;
    return { label: String(r.answer || '').replace(/《.*?》/g, '').trim(), score, id: r.id };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const seen = new Set();
  const out = [];
  for (const x of scored) {
    if (!x.label || seen.has(x.label)) continue;
    seen.add(x.label);
    out.push(x);
    if (out.length >= limit) break;
  }
  return out;
}

const cases = [
  { id: 'G01', type: 'paraphrase', input: '熱病後口渴明顯，胃裡像有熱，乾嘔，氣短乏力，想找接近的方證', expectedTop: '竹葉石膏湯' },
  { id: 'G02', type: 'mohw-paraphrase', input: '頭暈耳鳴，舌燥咽痛，腰脊痠痛，陰虛火旺', expectedTop: '知柏地黃丸' },
  { id: 'G03', type: 'mohw-paraphrase', input: '夜尿，自汗，耳鳴，命門火衰，畏寒，腎陽虛', expectedTop: '八味地黃丸' },
  { id: 'G04', type: 'mohw-paraphrase', input: '食少便溏，胃口差，脾胃虛弱，倦怠', expectedTop: '參苓白朮散' },
  { id: 'G05', type: 'classic-syndrome', input: '往來寒熱，胸脅苦滿，口苦咽乾，目眩，少陽不和', expectedTop: '小柴胡湯' },
  { id: 'G06', type: 'composition', input: '熟地黃 山茱萸 山藥 澤瀉 牡丹皮 茯苓', expectedAnyTop5: ['六味地黃丸', '八味地黃丸', '知柏地黃丸', '杞菊地黃丸'] },
  { id: 'G07', type: 'ambiguous', input: '咳嗽、胸悶、痰多，但沒有說寒熱和痰色', expectedBehavior: 'should_suggest_followup' },
  { id: 'G08', type: 'paraphrase', input: '外感受寒後咳嗽，痰白清稀，鼻塞流清涕，惡寒發熱，脈浮緊', expectedAnyTop5: ['三拗湯', '止咳散', '小青龍湯', '麻黃湯'] },
];

let top1 = 0;
let top5 = 0;
const details = [];
for (const tc of cases) {
  const out = matcher.directMatch(tc.input, 8);
  const labels = out.formulas.map(x => x.label);
  const naive = naiveBaseline(tc.input, 8).map(x => x.label);
  let okTop1 = false, okTop5 = false;
  if (tc.expectedTop) {
    okTop1 = labels[0] === tc.expectedTop;
    okTop5 = labels.slice(0, 5).includes(tc.expectedTop);
  } else if (tc.expectedAnyTop5) {
    okTop1 = tc.expectedAnyTop5.includes(labels[0]);
    okTop5 = labels.slice(0, 5).some(x => tc.expectedAnyTop5.includes(x));
  } else if (tc.expectedBehavior === 'should_suggest_followup') {
    // Ambiguous cases are counted as top5 success if the top candidates are diverse and not treated as self-stem exact.
    okTop1 = false;
    okTop5 = !out.intent?.selfStemExact && labels.length >= 3;
  }
  if (okTop1) top1 += 1;
  if (okTop5) top5 += 1;
  details.push({
    ...tc,
    okTop1,
    okTop5,
    top5: labels.slice(0, 5),
    topScores: out.formulas.slice(0, 5).map(x => Number(x.score.toFixed(3))),
    features: out.features.slice(0, 10),
    intent: out.intent,
    naiveBaselineTop5: naive.slice(0, 5),
  });
}
const result = {
  generatedAt: new Date().toISOString(),
  version: 'v050-generalized-diagnostic-demo',
  n: cases.length,
  top1,
  top1Accuracy: top1 / cases.length,
  top5,
  top5Accuracy: top5 / cases.length,
  notes: [
    'G07 is intentionally ambiguous; success means the matcher returns diverse candidates and the UI diagnostic panel should ask follow-up questions.',
    'naiveBaselineTop5 is a simple token-overlap baseline for demo comparison only, not a research-grade baseline.'
  ],
  details,
};
console.log(JSON.stringify(result, null, 2));
if (top5 < cases.length) process.exitCode = 1;
