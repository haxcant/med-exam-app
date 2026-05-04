#!/usr/bin/env node
/* Smoke test for formula_genie_matcher layered ranker. */
global.window = global;
global.document = {
  readyState: 'loading',
  addEventListener: () => {},
  getElementById: () => null,
  head: { appendChild: () => {} },
};
require('../formula_genie_data.js');
require('../formula_genie_matcher.js');

const cases = [
  { input: '胃熱陰傷 煩渴 嘔逆 少氣', expectedTop: '竹葉石膏湯' },
  { input: '風溫 誤汗 身熱多眠 鼻鼾 語言難出', expectedTop: '竹葉石膏湯' },
  { input: '腫脹 消渴兼證', expectedAnyTop3: ['杞菊地黃丸', '參苓白朮散'] },
  { input: '痙太陽病 無汗而小便反少 氣上衝胸 口噤不得語 欲作剛痙', expectedTop: '葛根湯' },
  { input: '衛福部 六味地黃丸 滋陰補腎 肝腎不足 消渴', expectedTop: '六味地黃丸' },
  { input: '熟地黃 山茱萸 山藥 澤瀉 牡丹皮 茯苓', expectedAnyTop3: ['六味地黃丸', '八味地黃丸', '知柏地黃丸', '杞菊地黃丸'] },
];
let failures = 0;
for (const tc of cases) {
  const out = global.FormulaGenieMatcher.directMatch(tc.input, 8);
  const labels = out.formulas.map(x => x.label);
  const top = labels[0] || '';
  let ok = true;
  if (tc.expectedTop) ok = top === tc.expectedTop;
  if (tc.expectedAnyTop3) ok = labels.slice(0, 3).some(x => tc.expectedAnyTop3.includes(x));
  console.log(JSON.stringify({ input: tc.input, intent: out.intent, top5: labels.slice(0, 5), ok }, null, 2));
  if (!ok) failures += 1;
}
if (failures) {
  console.error(`formula_genie_ranker_smoke_v048 failures=${failures}`);
  process.exit(1);
}
console.log('formula_genie_ranker_smoke_v048 ok');
