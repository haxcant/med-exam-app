(() => {
  'use strict';

  const DATA_SRC = './formula_genie_data.js?v=20260504fgv5';
  const DATA_GLOBAL = 'FORMULA_VECTOR_WEIGHTS_V015';
  const state = { loading: false, loaded: false, error: null, rows: [], selfStemIndex: null };

  const BROAD_STOP = new Set('氣血陰陽寒熱虛實痰濕水火風毒瘀痛口肺脾胃腎肝心膽腸尿'.split('').concat(['小便','大便','裡','表','上','中','下','脈','身','口','氣','血','熱','寒','虛','實']));
  const COARSE_AXIS_FEATURES = new Set(['寒','熱','虛','實','表','裡','濕','痰','瘀','水','火','燥','風','毒','肺','脾','胃','腎','肝','心','膽','腸','膀胱','上焦','中焦','下焦','咳','喘','痛','口','小便','大便','黃疸','消渴','癃閉','不寐','痿證','厥證']);


  const DIAGNOSTIC_ALIAS_GROUPS = [
    { canonical: '胃熱陰傷', aliases: ['胃中有熱','胃火','胃熱','熱病後口渴','熱退後口渴','口渴喜冷飲','煩渴','津傷胃熱'], syndrome: '胃熱陰傷', mechanism: '熱病後期或餘熱未清，胃陰受傷，津液不足，胃氣失和。' },
    { canonical: '氣津兩傷', aliases: ['氣短乏力','少氣','疲倦口乾','熱後氣虛','氣陰兩傷','氣津不足'], syndrome: '氣津兩傷', mechanism: '熱邪耗氣傷津，故見少氣、口乾、乏力等線索。' },
    { canonical: '嘔逆', aliases: ['乾嘔','噁心','想吐','胃氣上逆','嘔吐','反胃'], syndrome: '胃氣上逆', mechanism: '胃失和降，氣機上逆，常與熱、寒、痰飲或食滯互參。' },
    { canonical: '風寒襲肺', aliases: ['外感風寒','風寒犯肺','受寒咳嗽','鼻塞流清涕','清鼻涕','惡寒發熱','痰白清稀','脈浮緊'], syndrome: '風寒襲肺', mechanism: '風寒束表，肺氣失宣，故咳嗽、鼻塞、惡寒、痰白。' },
    { canonical: '風熱犯肺', aliases: ['外感風熱','風熱咳嗽','咽痛咳嗽','痰黃','黃痰','口渴咽痛','發熱微惡風'], syndrome: '風熱犯肺', mechanism: '風熱犯肺，肺失清肅，熱灼津液則痰黃、咽痛、口渴。' },
    { canonical: '痰熱壅肺', aliases: ['痰黃稠','黃稠痰','痰熱','胸悶痰多','咳嗽痰黃','喘咳痰黃','痰黏難咯'], syndrome: '痰熱壅肺', mechanism: '痰與熱互結，壅阻肺氣，肺失宣降，故咳喘、痰黃稠、胸悶。' },
    { canonical: '寒飲伏肺', aliases: ['清稀白痰','痰多清稀','遇寒加重','喘咳清稀','水飲','寒痰','背寒'], syndrome: '寒飲伏肺', mechanism: '寒飲內停，上犯於肺，肺氣不利，故喘咳、痰清稀。' },
    { canonical: '脾胃虛弱', aliases: ['食少便溏','胃口差','納差','容易腹瀉','大便稀','脾虛','倦怠食少'], syndrome: '脾胃虛弱', mechanism: '脾胃氣虛，運化失健，故食少、便溏、倦怠。' },
    { canonical: '肝腎陰虛', aliases: ['腰膝痠軟','腰痠','頭暈目眩','眼睛乾澀','視物不清','耳鳴','陰虛','五心煩熱'], syndrome: '肝腎陰虛', mechanism: '肝腎陰精不足，不能濡養腰膝、耳目，虛熱可內擾。' },
    { canonical: '腎陽虛', aliases: ['畏寒肢冷','夜尿多','腰膝冷痛','命門火衰','陽虛','自汗','小便清長'], syndrome: '腎陽虛', mechanism: '腎陽不足，溫煦與氣化失職，故畏寒、夜尿、自汗、腰膝冷。' },
    { canonical: '陰虛火旺', aliases: ['舌燥咽痛','潮熱盜汗','骨蒸','咽乾','虛火','口乾咽痛','腰脊痠痛'], syndrome: '陰虛火旺', mechanism: '陰液不足，虛火內擾，上炎則咽痛、舌燥，下虛則腰痠。' },
    { canonical: '血虛血瘀', aliases: ['瘀血','刺痛','固定痛','經痛有血塊','血瘀','面色萎黃','月經不調'], syndrome: '血虛血瘀', mechanism: '血虛不能濡養，或瘀血阻絡，不通則痛。' },
    { canonical: '少陽不和', aliases: ['往來寒熱','胸脅苦滿','口苦咽乾','目眩','半表半裡','少陽證'], syndrome: '少陽不和', mechanism: '邪在少陽，樞機不利，故寒熱往來、胸脅苦滿、口苦。' },
    { canonical: '陽明腑實', aliases: ['大便不通','便秘腹滿','潮熱譫語','腹痛拒按','燥屎','腑實'], syndrome: '陽明腑實', mechanism: '熱結陽明，燥屎內停，腑氣不通，故腹滿便秘。' }
  ];

  const DEMO_CASES_V050 = [
    { title: '泛化改寫：胃熱陰傷', input: '熱病後口渴明顯，胃裡像有熱，乾嘔，氣短乏力，想找接近的方證', expected: '竹葉石膏湯' },
    { title: '症狀敘述：風寒咳嗽', input: '外感受寒後咳嗽，痰白清稀，鼻塞流清涕，惡寒發熱，脈浮緊', expected: '三拗湯／止嗽散類' },
    { title: '鑑別展示：地黃丸家族', input: '腰痠，頭暈目眩，眼睛乾澀，視物不清，肝腎陰虛', expected: '杞菊地黃丸' },
    { title: '成分查方：六味地黃丸家族', input: '熟地黃 山茱萸 山藥 澤瀉 牡丹皮 茯苓', expected: '六味地黃丸家族' },
    { title: '不確定案例：要求補問', input: '咳嗽、胸悶、痰多，但沒有說寒熱和痰色', expected: '應提出補問，不宜硬判單方' }
  ];

  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s) { return escapeHtml(s).replace(/`/g, '&#96;'); }
  function normText(s) {
    let x = String(s || '');
    const map = {'裏':'裡','溼':'濕','凉':'涼','不':'不','冷':'冷','參':'參','龍':'龍','連':'連','行':'行','降':'降'};
    for (const [a, b] of Object.entries(map)) x = x.split(a).join(b);
    return x.replace(/[_＿]+/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[「」『』【】\[\]{}（）()<>]/g, ' ')
      .replace(/[。？?！!，,、；;：:｜|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function data() { return window[DATA_GLOBAL]; }
  function normFormula(s) {
    const D = data() || {};
    const x = normText(s);
    return (D.formulaAliasFixV015 && D.formulaAliasFixV015[x]) || x;
  }

  function selfStemKey(s) {
    return normText(s)
      .replace(/\s+/g, '')
      .replace(/[第題號]/g, '')
      .replace(/[0-9０-９]+/g, '')
      .trim();
  }
  function addSelfStemVariant(map, text, item) {
    const key = selfStemKey(text);
    if (!key || key.length < 3) return;
    if (!map.has(key)) map.set(key, []);
    const arr = map.get(key);
    const existing = arr.find(x => x.id === item.id && x.answer === item.answer);
    if (existing) {
      if (item.displayAnswer) existing.displayAnswer = item.displayAnswer;
      if (item.question) existing.question = item.question;
      if (item.variantType && !String(existing.variantType || '').startsWith('question')) existing.variantType = item.variantType;
      return;
    }
    arr.push(item);
  }
  function extractOriginalLine(explanation) {
    const m = String(explanation || '').match(/原文[:：]\s*([^\n]+)/);
    return m ? m[1].trim() : '';
  }
  function questionOptionText(q) {
    const opts = Array.isArray(q?.options) ? q.options : [];
    if (!opts.length) return '';
    return opts.map((o, i) => `${i + 1}. ${typeof o === 'string' ? o : (o?.text || o?.label || '')}`).join(' ');
  }
  function buildSelfStemIndex() {
    if (state.selfStemIndex) return state.selfStemIndex;
    const index = new Map();
    const rows = prepareRows();
    for (const row of rows) {
      const label = normFormula(row.answer || '');
      if (!label) continue;
      addSelfStemVariant(index, row.prompt || '', {
        id: row.id || '',
        answer: label,
        displayAnswer: row.answer || label,
        prompt: row.prompt || '',
        source: row,
        variantType: 'training-row-prompt'
      });
    }
    const bank = Array.isArray(window.MED_QUESTION_BANK) ? window.MED_QUESTION_BANK : [];
    for (const q of bank) {
      const label = normFormula(q.answer || '');
      if (!label) continue;
      const base = { id: q.id || '', answer: label, displayAnswer: q.answer || label, prompt: q.prompt || '', question: q, variantType: 'question-prompt' };
      addSelfStemVariant(index, q.prompt || '', base);
      const optText = questionOptionText(q);
      if (optText) {
        addSelfStemVariant(index, `${q.prompt || ''} ${optText}`, { ...base, variantType: 'question-prompt-with-options' });
        addSelfStemVariant(index, `${q.prompt || ''} 選項 ${optText}`, { ...base, variantType: 'question-prompt-with-options' });
      }
      // A blank-stripped prompt remains question-specific in most cloze questions and helps when the user pastes the old text without underline marks.
      const noBlank = String(q.prompt || '').replace(/[＿_]+/g, '');
      if (noBlank !== q.prompt) addSelfStemVariant(index, noBlank, { ...base, variantType: 'question-prompt-no-blank' });
      if (noBlank !== q.prompt && optText) addSelfStemVariant(index, `${noBlank} ${optText}`, { ...base, variantType: 'question-no-blank-with-options' });
      // Full original lines can be ambiguous when one classical sentence contains more than one formula.
      // They are indexed, but exact certainty is enabled only if all hits share the same answer.
      const original = extractOriginalLine(q.explanation);
      if (original) addSelfStemVariant(index, original, { ...base, prompt: original, variantType: 'explanation-original-line' });
    }
    state.selfStemIndex = index;
    return index;
  }
  function findSelfStemHits(prompt) {
    const index = buildSelfStemIndex();
    const key = selfStemKey(prompt);
    if (!key) return [];
    return index.get(key) || [];
  }
  function makeSelfStemResult(hit, prompt, features) {
    const row = hit.source || {
      id: hit.id,
      answer: hit.answer,
      prompt: hit.prompt || prompt,
      features: {}
    };
    const matched = [];
    matched.push({
      feature: '題庫自身題幹完全命中',
      inputWeight: 10.0,
      rowWeight: 10.0,
      contribution: 120.0,
      matchType: hit.variantType || 'self-stem-exact',
      matchedFeature: hit.id || hit.answer,
      className: 'self'
    });
    const rowFeatures = row.features || {};
    for (const [f, w] of Object.entries(features || {}).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 18)) {
      const rw = Number(rowFeatures[f] || 0);
      if (rw > 0) {
        matched.push({
          feature: f,
          inputWeight: Number(w) || 0,
          rowWeight: rw,
          contribution: Math.min(8.0, Math.sqrt(Math.max(0, Number(w) || 0) * Math.max(0, rw))),
          matchType: 'exact-feature-under-self-match',
          matchedFeature: f,
          className: featureClass(f)
        });
      }
    }
    matched.sort((a, b) => b.contribution - a.contribution || String(a.feature).localeCompare(String(b.feature)));
    return {
      row,
      label: hit.displayAnswer || hit.answer,
      score: 120.0 + matched.slice(1).reduce((acc, x) => acc + Number(x.contribution || 0) * 0.15, 0),
      exact: matched.length,
      strongExact: matched.length,
      nonBroadExact: matched.length,
      matched,
      sourceIsMohw: isMohwRow(row),
      selfStemExact: true,
      selfStemVariantType: hit.variantType || 'self-stem-exact'
    };
  }
  function topFeatures(features, limit = 12) {
    return Object.entries(features || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]) || String(a[0]).localeCompare(String(b[0])))
      .slice(0, limit);
  }
  function splitStemTokens(prompt) {
    return normText(prompt)
      .split(/[\s,.;:，。；：、/／\-–—]+/)
      .map(x => x.trim().replace(/^\d+|\d+$/g, ''))
      .filter(x => x.length >= 2 && /[\u4e00-\u9fff]/.test(x));
  }
  function addFeature(obj, f, w) {
    if (!f || !/[\u4e00-\u9fff]/.test(f)) return;
    obj[f] = Math.max(obj[f] || 0, Number(w) || 0);
  }
  function extractFeatures(prompt) {
    const D = data() || {};
    const t = normText(prompt);
    const feats = {};
    for (const q of (D.oracleQuestionBankV015 || [])) {
      const f = String(q.feature || '').trim();
      if (f.length >= 2 && t.includes(f)) addFeature(feats, f, f.length >= 4 ? 2.8 : 0.8);
    }
    for (const phrase of Object.keys(D.directPhrasesV015 || {})) {
      if (t.includes(phrase)) addFeature(feats, phrase, 4.0);
    }
    for (const group of DIAGNOSTIC_ALIAS_GROUPS) {
      let hitCount = 0;
      for (const alias of group.aliases || []) {
        if (alias && t.includes(alias)) {
          hitCount += 1;
          addFeature(feats, alias, alias.length >= 4 ? 2.2 : 1.4);
        }
      }
      if (hitCount > 0) {
        addFeature(feats, group.canonical, Math.min(5.2, 3.0 + hitCount * 0.55));
        if (group.syndrome && group.syndrome !== group.canonical) addFeature(feats, group.syndrome, Math.min(4.2, 2.4 + hitCount * 0.35));
      }
    }
    const toks = splitStemTokens(t);
    for (const tok of toks) {
      if (!BROAD_STOP.has(tok) && tok.length >= 3) addFeature(feats, tok, tok.length <= 10 ? 2.4 : 1.9);
    }
    for (let i = 0; i < toks.length - 1; i += 1) {
      const pair = toks[i] + toks[i + 1];
      if (pair.length >= 4 && pair.length <= 16 && !BROAD_STOP.has(toks[i]) && !BROAD_STOP.has(toks[i + 1])) addFeature(feats, pair, 2.8);
    }
    return feats;
  }
  const HIGH_FREQ_HERBS = new Set(['甘草','炙甘草','茯苓','白朮','人參','生薑','大棗','半夏','陳皮','當歸','白芍','川芎','黃芩','黃連','大黃','桂枝','麻黃','杏仁','地黃','熟地黃','山藥']);
  const HERB_HINTS = new Set([
    '熟地黃','生地黃','地黃','山茱萸','山藥','澤瀉','牡丹皮','茯苓','知母','黃柏','枸杞子','菊花','人參','黨參','黃耆','白朮','蒼朮','甘草','炙甘草','半夏','陳皮','青皮','柴胡','黃芩','黃連','大黃','芒硝','桂枝','肉桂','附子','炮附子','乾薑','生薑','當歸','川芎','白芍','赤芍','桃仁','紅花','丹參','麥門冬','麥冬','天門冬','天冬','石膏','粳米','麻黃','杏仁','桔梗','貝母','瓜蔞','栝蔞','厚朴','枳實','枳殼','香附','砂仁','木香','藿香','薄荷','連翹','金銀花','銀花','防風','羌活','獨活','牛膝','杜仲','續斷','葛根','升麻','細辛','五味子','酸棗仁','遠志','龍骨','牡蠣','竹茹','鉤藤','鈎藤','大棗','蓮子','薏苡仁','白扁豆','滑石','木通','車前子'
  ]);
  const CLASS_MULTIPLIER = { name: 2.2, signature: 1.35, support: 1.0, herb: 0.62, broad: 0.20 };

  function isMohwRow(row) {
    return !!(row?.mohw || row?.sourceLayer === 'mohw_official_formula_v076' || String(row?.id || '').startsWith('MOHW-'));
  }
  function isHerbFeature(feature) {
    const x = String(feature || '');
    return HERB_HINTS.has(x) || /[參苓朮草黃芩連柏桂附薑芍芎歸膝藤花仁皮母冬夏棗瀉蠣茹香砂蔞杏麻荷翹銀]/.test(x) && x.length >= 2 && x.length <= 5;
  }
  function herbMentionCount(t) {
    let c = 0;
    for (const h of HERB_HINTS) if (t.includes(h)) c += 1;
    return c;
  }
  function formulaMentionCount(t) {
    const rows = prepareRows();
    const names = new Set(rows.map(r => r.__label).filter(Boolean));
    let c = 0;
    for (const name of names) if (name.length >= 2 && t.includes(name)) c += 1;
    return c;
  }
  function detectIntent(prompt) {
    const t = normText(prompt);
    const herbs = herbMentionCount(t);
    const formulaMentions = formulaMentionCount(t);
    const mohw = /衛福部|中醫藥司|基準方|官方|項次|飲片量|公克/.test(t);
    const composition = /組成|成分|配方|處方|藥味|藥材|含有|包含|加減|去加/.test(t) || herbs >= 3;
    const examStem = /條文|下列|何方|何者|可與|主之|金匱|傷寒|溫病|醫宗|辨證|證型|病機|治法|治則|兼證|方證|考題|國考/.test(t);
    const formulaLookup = formulaMentions > 0;
    return { text: t, herbs, formulaMentions, mohw, composition, examStem, formulaLookup };
  }
  function featureClass(feature, cls) {
    if (cls) return cls;
    const x = String(feature || '');
    if (!x) return 'support';
    if (COARSE_AXIS_FEATURES.has(x) || x.length <= 1) return 'broad';
    if (isHerbFeature(x)) return 'herb';
    if (x.endsWith('湯') || x.endsWith('丸') || x.endsWith('散') || x.endsWith('丹') || x.endsWith('飲') || x.endsWith('方')) return 'name';
    if (x.length >= 5) return 'signature';
    if (x.length === 2 && /[寒熱虛實濕痰瘀水火燥風毒氣血陰陽]/.test(x)) return 'broad';
    return 'support';
  }
  function featureFamily(f) {
    const x = String(f || '');
    if (x.includes('百合')) return '百合病';
    if (x.includes('痙')) return '痙病';
    if (x.includes('暍') || x.includes('暑')) return '暑暍';
    if (x.includes('風濕')) return '風濕';
    if (x.includes('小便') || x.includes('尿') || x.includes('癃')) return '小便';
    if (x.includes('汗')) return '汗';
    if (x.includes('渴')) return '渴';
    if (x.includes('咳') || x.includes('喘') || x.includes('肺')) return '肺咳喘';
    if (x.includes('熱')) return '熱';
    if (x.includes('寒') || x.includes('冷')) return '寒';
    if (x.includes('痛') || x.includes('疼')) return '痛';
    return x.slice(0, 2);
  }
  function rowStrengthInfo(rowFeatures, feature, prompt) {
    const feats = rowFeatures || {};
    const f = String(feature || '');
    const cls = featureClass(f);
    if (!f) return { weight: 0, type: 'none', matchedFeature: '', cls };
    if (Object.prototype.hasOwnProperty.call(feats, f)) {
      return { weight: Number(feats[f] || 0), type: 'exact', matchedFeature: f, cls };
    }
    const t = normText(prompt);
    if (f.length >= 4 && cls !== 'broad' && t.includes(f)) {
      return { weight: f.length >= 6 ? 2.0 : 1.2, type: 'prompt', matchedFeature: f, cls };
    }
    let best = { weight: 0, type: 'none', matchedFeature: '', cls };
    // Conservative fuzzy match. This replaces the old substring/family fallback that let MOHW rows accumulate many weak matches.
    if (f.length >= 4 && cls !== 'broad') {
      for (const [rf, rw0] of Object.entries(feats)) {
        const rfs = String(rf || '');
        const rcls = featureClass(rfs);
        if (rcls === 'broad' || rfs.length < 3) continue;
        const rw = Number(rw0 || 0);
        if (rfs === f) continue;
        const contains = rfs.includes(f) || f.includes(rfs);
        if (!contains) continue;
        const ratio = Math.min(rfs.length, f.length) / Math.max(rfs.length, f.length);
        if (ratio < 0.45) continue;
        const w = rw * (ratio >= 0.75 ? 0.48 : 0.30);
        if (w > best.weight) best = { weight: w, type: 'substring', matchedFeature: rfs, cls };
      }
    }
    return best;
  }
  function inputFeatureMultiplier(feature, intent) {
    const cls = featureClass(feature);
    let mult = CLASS_MULTIPLIER[cls] || 1.0;
    if (cls === 'herb') {
      mult = intent.composition ? 1.15 : 0.42;
      if (HIGH_FREQ_HERBS.has(feature)) mult *= 0.62;
    }
    if (cls === 'broad') mult = 0.16;
    if (cls === 'name' && intent.formulaLookup) mult = 2.5;
    return mult;
  }
  function rowSourceFactor(row, intent, strongExact, nonBroadExact) {
    if (!isMohwRow(row)) {
      return intent.examStem ? 1.10 : 1.0;
    }
    let factor = 0.76;
    if (intent.mohw) factor = 1.15;
    else if (intent.composition) factor = 1.02;
    else if (intent.formulaLookup) factor = 1.0;
    else if (intent.examStem) factor = 0.62;
    if (!intent.mohw && !intent.composition && nonBroadExact < 2) factor *= 0.70;
    if (!intent.mohw && strongExact <= 0) factor *= 0.72;
    return factor;
  }
  function shouldUseFamilyFallback(intent, feature) {
    if (intent.mohw || intent.composition) return false;
    const cls = featureClass(feature);
    return cls === 'signature' && String(feature).length >= 5;
  }
  function prepareRows() {
    if (state.rows.length) return state.rows;
    const D = data() || {};
    state.rows = (D.oracleTrainingRowsV015 || []).map((r, i) => ({ ...r, __idx: i, __label: normFormula(r.answer || '') }));
    return state.rows;
  }
  function renderStatus() {
    const D = data();
    const statsEl = $('formulaGenieStats');
    if (!statsEl) return;
    if (state.error) {
      statsEl.innerHTML = `<span class="formula-genie-status-bad">資料載入失敗：${escapeHtml(state.error.message || state.error)}</span>`;
      return;
    }
    if (!D) {
      statsEl.textContent = state.loading ? '方劑資料載入中…' : '尚未載入方劑資料，展開或按「揣測方劑」後會自動載入。';
      return;
    }
    const rows = prepareRows();
    const unique = new Set(rows.map(r => r.__label).filter(Boolean)).size;
    const featureCount = D.stats?.featureCount || Object.keys(D.vocab || {}).length || '-';
    statsEl.innerHTML = `已載入 <strong>${rows.length}</strong> 筆題幹列、<strong>${unique}</strong> 個方劑候選、約 <strong>${featureCount}</strong> 個特徵。`;
  }
  function loadData() {
    if (data()) {
      state.loaded = true;
      prepareRows();
      renderStatus();
      return Promise.resolve(data());
    }
    if (state.loading) {
      return new Promise((resolve, reject) => {
        const started = Date.now();
        const timer = setInterval(() => {
          if (data()) { clearInterval(timer); resolve(data()); }
          else if (state.error) { clearInterval(timer); reject(state.error); }
          else if (Date.now() - started > 20000) { clearInterval(timer); reject(new Error('方劑資料載入逾時')); }
        }, 120);
      });
    }
    state.loading = true;
    renderStatus();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = DATA_SRC;
      script.async = true;
      script.onload = () => {
        state.loading = false;
        state.loaded = !!data();
        if (!data()) {
          state.error = new Error('找不到 window.' + DATA_GLOBAL);
          renderStatus();
          reject(state.error);
          return;
        }
        prepareRows();
        renderStatus();
        resolve(data());
      };
      script.onerror = () => {
        state.loading = false;
        state.error = new Error('無法載入 formula_genie_data.js');
        renderStatus();
        reject(state.error);
      };
      document.head.appendChild(script);
    });
  }
  function directMatch(prompt, limit) {
    const rows = prepareRows();
    const earlySelfHits = findSelfStemHits(prompt);
    const earlySelfAnswers = Array.from(new Set(earlySelfHits.map(x => x.answer).filter(Boolean)));
    if (earlySelfAnswers.length === 1) {
      const hit = earlySelfHits.find(x => x.question) || earlySelfHits[0];
      const seedFeatures = { ...(hit.source?.features || {}) };
      if (!Object.keys(seedFeatures).length && hit.question) {
        addFeature(seedFeatures, hit.answer, 9.0);
      }
      const qTopSelf = topFeatures(seedFeatures, 45);
      const selfBase = makeSelfStemResult(hit, prompt, seedFeatures);
      return {
        features: qTopSelf,
        formulas: [selfBase],
        intent: { text: normText(prompt), selfStemExact: true, selfStemHitCount: earlySelfHits.length, selfStemVariantType: selfBase.selfStemVariantType }
      };
    }
    if (earlySelfAnswers.length > 1) {
      const mergedFeatures = {};
      const formulas = [];
      for (const ans of earlySelfAnswers) {
        const hit = earlySelfHits.find(x => x.answer === ans && x.question) || earlySelfHits.find(x => x.answer === ans);
        if (!hit) continue;
        const localFeatures = { ...(hit.source?.features || {}) };
        for (const [f, w] of Object.entries(localFeatures)) mergedFeatures[f] = Math.max(Number(mergedFeatures[f] || 0), Number(w || 0));
        const item = makeSelfStemResult(hit, prompt, localFeatures);
        item.score = 118.0 + formulas.length * -0.001;
        item.selfStemAmbiguous = true;
        item.matched.unshift({
          feature: '完全題幹命中，但此題幹在題庫中對應多個答案；請加入選項或題號以精準鎖定',
          inputWeight: 9.5,
          rowWeight: 9.5,
          contribution: 118.0,
          matchType: 'ambiguous-self-stem',
          matchedFeature: hit.id || ans,
          className: 'self'
        });
        formulas.push(item);
      }
      return {
        features: topFeatures(mergedFeatures, 45),
        formulas: formulas.slice(0, Math.max(3, Math.min(20, limit || 10))),
        intent: { text: normText(prompt), selfStemAmbiguous: true, selfStemHitCount: earlySelfHits.length, selfStemAnswerCount: earlySelfAnswers.length }
      };
    }
    const intent = detectIntent(prompt);
    const feats = extractFeatures(prompt);
    const qTop = topFeatures(feats, 45);
    const rowScores = rows.map(row => {
      let score = 0;
      let exact = 0;
      let strongExact = 0;
      let nonBroadExact = 0;
      let broadOnlyScore = 0;
      let herbScore = 0;
      const matched = [];
      const rowFeatureKeys = Object.keys(row.features || {});
      for (const [f, w] of qTop) {
        const inputWeight = Number(w) || 0;
        const info = rowStrengthInfo(row.features || {}, f, row.prompt || '');
        let rw = info.weight;
        if (rw > 0) {
          const cls = featureClass(f);
          const lengthMult = f.length >= 7 ? 1.28 : f.length >= 4 ? 1.06 : 0.68;
          const sourceMult = inputFeatureMultiplier(f, intent);
          let contribution = Math.sqrt(Math.max(0, inputWeight) * Math.max(0, rw)) * lengthMult * sourceMult;
          if (info.type !== 'exact') contribution *= 0.62;
          if (cls === 'broad') broadOnlyScore += contribution;
          if (cls === 'herb') herbScore += contribution;
          contribution = Math.min(contribution, cls === 'name' ? 8.0 : 4.5);
          score += contribution;
          if (info.type === 'exact') exact += 1;
          if (info.type === 'exact' && cls !== 'broad' && cls !== 'herb') strongExact += 1;
          if (info.type === 'exact' && cls !== 'broad') nonBroadExact += 1;
          matched.push({ feature: f, inputWeight, rowWeight: rw, contribution, matchType: info.type, matchedFeature: info.matchedFeature, className: cls });
        } else if (shouldUseFamilyFallback(intent, f) && rowFeatureKeys.some(rf => featureFamily(rf) === featureFamily(f) && featureClass(rf) !== 'broad')) {
          // Family fallback is now tiny and cannot by itself push official rows to the top.
          const contribution = 0.006 * inputWeight;
          score += contribution;
        }
      }
      if (intent.formulaLookup && row.__label && intent.text.includes(row.__label)) {
        score += 12.0;
        strongExact += 1;
        nonBroadExact += 1;
        matched.unshift({ feature: row.__label, inputWeight: 6.0, rowWeight: 6.0, contribution: 12.0, matchType: 'formula-name', matchedFeature: row.__label, className: 'name' });
      }
      // If the row is supported almost entirely by broad terms or high-frequency herbs, reduce its rank sharply.
      if (!intent.composition && !intent.mohw) {
        if (nonBroadExact === 0) score *= 0.34;
        else if (strongExact === 0 && herbScore > score * 0.45) score *= 0.56;
        if (broadOnlyScore > 0 && broadOnlyScore >= score * 0.55) score *= 0.45;
      }
      score *= rowSourceFactor(row, intent, strongExact, nonBroadExact);
      matched.sort((a, b) => b.contribution - a.contribution || b.rowWeight - a.rowWeight || String(a.feature).localeCompare(String(b.feature)));
      return { row, label: row.__label, score, exact, strongExact, nonBroadExact, matched, sourceIsMohw: isMohwRow(row) };
    }).sort((a, b) => b.score - a.score || String(a.label).localeCompare(String(b.label)));

    // Aggregate by formula. If a formula appears in both classic/exam rows and MOHW rows,
    // keep the strongest evidence but add a small cross-source support bonus instead of duplicating cards.
    const formulaBuckets = new Map();
    for (const x of rowScores) {
      if (!x.label || x.score <= 0) continue;
      if (!formulaBuckets.has(x.label)) formulaBuckets.set(x.label, []);
      formulaBuckets.get(x.label).push(x);
    }
    let formulas = Array.from(formulaBuckets.entries()).map(([label, bucket]) => {
      bucket.sort((a, b) => b.score - a.score);
      const crossSource = new Set(bucket.map(x => x.sourceIsMohw ? 'mohw' : 'legacy')).size > 1;
      const rawBest = bucket[0];
      // When the same formula has both exam/classic and MOHW evidence, ordinary input should display
      // the exam/classic row when it is reasonably close, so the UI does not look like MOHW has taken over.
      const bestLegacy = bucket.find(x => !x.sourceIsMohw);
      const displayBase = (!intent.mohw && !intent.composition && rawBest.sourceIsMohw && bestLegacy && bestLegacy.score >= rawBest.score * 0.50)
        ? bestLegacy
        : rawBest;
      const best = { ...displayBase };
      const support = bucket.filter(x => x !== displayBase).slice(0, 3).reduce((acc, x) => acc + Math.max(0, x.score) * 0.08, 0);
      best.score = Math.max(best.score, rawBest.score) + support;
      best.crossSource = crossSource;
      best.sourceAlternates = bucket.filter(x => x !== displayBase).slice(0, 4);
      return best;
    }).sort((a, b) => b.score - a.score || String(a.label).localeCompare(String(b.label)));

    // In ordinary辨證／題幹 mode, prevent weak MOHW-only hits from occupying almost all visible slots.
    if (!intent.mohw && !intent.composition) {
      const topScore = formulas[0]?.score || 0;
      const legacy = formulas.filter(x => !x.sourceIsMohw || x.crossSource);
      const official = formulas.filter(x => x.sourceIsMohw && !x.crossSource);
      const balanced = [];
      let officialInFirstFive = 0;
      for (const x of formulas) {
        if (balanced.includes(x)) continue;
        if (x.sourceIsMohw && !x.crossSource && balanced.length < 5) {
          if (officialInFirstFive >= 2) continue;
          officialInFirstFive += 1;
        }
        balanced.push(x);
        if (balanced.length >= limit) break;
      }
      for (const x of [...legacy, ...official]) {
        if (balanced.length >= limit) break;
        if (!balanced.includes(x)) balanced.push(x);
      }
      formulas = balanced;
    } else {
      formulas = formulas.slice(0, limit);
    }
    return { features: qTop, formulas, intent };
  }

  function inferDiagnosticGroups(featureEntries, formulas) {
    const text = (featureEntries || []).map(x => x[0]).join(' ');
    const matched = [];
    for (const group of DIAGNOSTIC_ALIAS_GROUPS) {
      const keys = [group.canonical, group.syndrome, ...(group.aliases || [])].filter(Boolean);
      let count = 0;
      for (const k of keys) if (text.includes(k)) count += 1;
      if (count > 0) matched.push({ ...group, count });
    }
    matched.sort((a, b) => b.count - a.count || String(a.canonical).localeCompare(String(b.canonical)));
    if (!matched.length && formulas?.[0]?.row?.mohw) {
      const m = formulas[0].row.mohw;
      const fx = normText(`${m.effect || ''} ${m.indications || ''}`);
      for (const group of DIAGNOSTIC_ALIAS_GROUPS) {
        const keys = [group.canonical, group.syndrome, ...(group.aliases || [])].filter(Boolean);
        let count = 0;
        for (const k of keys) if (fx.includes(k)) count += 1;
        if (count > 0) matched.push({ ...group, count: count * 0.75 });
      }
      matched.sort((a, b) => b.count - a.count);
    }
    return matched.slice(0, 3);
  }
  function renderDiagnosticAdvice(payload) {
    const { features = [], formulas = [], intent = {} } = payload || {};
    if (!formulas.length) return '';
    const top = formulas[0];
    const second = formulas[1];
    const groups = inferDiagnosticGroups(features, formulas);
    const topMatched = Array.isArray(top.matched) ? top.matched : [];
    const support = topMatched
      .filter(m => m.className !== 'broad')
      .slice(0, 6)
      .map(m => `${escapeHtml(m.feature)} <b>+${Number(m.contribution || 0).toFixed(2)}</b>`)
      .join('、') || '目前主要依整體文字相似度排序，明確辨證特徵不足。';
    const syndrome = groups.length ? groups.map(g => g.syndrome || g.canonical).join('、') : '證型未能唯一判定，需看候選方與補問';
    const mechanism = groups.length ? groups.map(g => g.mechanism).filter(Boolean).join('；') : '輸入線索不足，建議補足寒熱、虛實、痰色、汗出、二便、舌脈等資訊。';
    const effect = top.row?.mohw?.effect || '';
    const indications = top.row?.mohw?.indications || '';
    const sourceHint = effect || indications
      ? `官方／題庫摘要：${escapeHtml([effect, indications].filter(Boolean).join('；'))}`
      : `來源題摘要：${escapeHtml(String(top.row?.prompt || '').slice(0, 120))}`;
    const followUps = buildFollowUpQuestions(payload).map(q => `<li>${escapeHtml(q)}</li>`).join('');
    const gap = second ? Math.max(0, top.score - second.score) : top.score;
    const gapText = second ? `第一名與第二名差距 ${gap.toFixed(2)}；若差距小，展示時可強調系統會提出補問而非硬猜。` : '目前只有單一主要候選。';
    const modeBits = [];
    if (intent.selfStemExact) modeBits.push('自身題幹 exact 命中');
    if (intent.selfStemAmbiguous) modeBits.push('自身題幹多答案歧義');
    if (intent.composition) modeBits.push('組成／藥材查方');
    if (intent.examStem) modeBits.push('考題／古文辨證');
    if (intent.mohw) modeBits.push('衛福部官方查詢');
    if (!modeBits.length) modeBits.push('泛化症狀辨證');
    return `<section class="formula-genie-diagnostic">
      <div class="formula-genie-diagnostic-head">
        <strong>模擬辨證建議</strong>
        <span>${escapeHtml(modeBits.join('＋'))}</span>
      </div>
      <div class="formula-genie-diagnostic-grid">
        <div><b>最可能候選</b><p>${escapeHtml(top.label)}${second ? `；次候選：${escapeHtml(second.label)}` : ''}</p></div>
        <div><b>可能證型</b><p>${escapeHtml(syndrome)}</p></div>
        <div><b>病機摘要</b><p>${escapeHtml(mechanism)}</p></div>
        <div><b>方義／來源摘要</b><p>${sourceHint}</p></div>
      </div>
      <div class="formula-genie-demo-box"><b>展示算法優勢</b><p>此結果同時使用 exact/self-stem、同義辨證特徵、來源分層、弱命中降噪與候選重排；不是只用題幹字串相似度。${escapeHtml(gapText)}</p></div>
      <div class="formula-genie-support"><b>主要命中特徵</b><p>${support}</p></div>
      ${followUps ? `<details class="formula-genie-follow"><summary>建議補問／鑑別線索</summary><ol>${followUps}</ol></details>` : ''}
      <p class="formula-genie-safety-note">學習展示用模擬辨證，不作臨床診療或實際處方建議。</p>
    </section>`;
  }
  function buildFollowUpQuestions(payload) {
    const formulas = payload?.formulas || [];
    const features = new Set((payload?.features || []).map(x => x[0]));
    const qs = [];
    const labels = formulas.slice(0, 4).map(x => x.label);
    const topFeatureSets = formulas.slice(0, 4).map(x => Object.keys(x.row?.features || {}).filter(f => featureClass(f) !== 'broad' && !features.has(f)));
    const counts = new Map();
    for (const arr of topFeatureSets) for (const f of arr.slice(0, 40)) counts.set(f, (counts.get(f) || 0) + 1);
    const discriminators = Array.from(counts.entries())
      .filter(([f, c]) => c > 0 && c < Math.max(2, topFeatureSets.length) && f.length >= 2 && f.length <= 10 && !isHerbFeature(f))
      .sort((a, b) => a[1] - b[1] || b[0].length - a[0].length)
      .slice(0, 4)
      .map(x => x[0]);
    if (labels.length >= 2) qs.push(`目前前列候選包含 ${labels.slice(0, 3).join('、')}，需確認哪些線索最符合原題或症狀。`);
    for (const f of discriminators) qs.push(`是否存在「${f}」這個鑑別線索？`);
    const joined = (payload?.features || []).map(x => x[0]).join(' ');
    if (/咳|喘|肺|痰/.test(joined)) qs.push('痰色偏白清稀還是黃稠？是否惡寒、發熱、口渴或喘？');
    if (/渴|胃|嘔|熱/.test(joined)) qs.push('口渴是否喜冷飲？是否乾嘔、少氣、熱退後仍煩渴？');
    if (/陰虛|肝腎|腰|目|耳/.test(joined)) qs.push('主要偏目澀視物不清、咽痛虛火，還是夜尿畏寒？這會影響地黃丸家族鑑別。');
    return Array.from(new Set(qs)).slice(0, 6);
  }

  function confidenceLabel(score, topScore) {
    if (!topScore || score <= 0) return '低';
    const r = score / topScore;
    if (r >= 0.92) return '高';
    if (r >= 0.70) return '中';
    return '低';
  }

  function renderMohwMeta(row) {
    const m = row?.mohw;
    if (!m) return '';
    const chips = [];
    if (m.itemNo) chips.push(`項次 ${escapeHtml(m.itemNo)}`);
    if (m.origin) chips.push(`出典：${escapeHtml(m.origin)}`);
    if (m.effect) chips.push(`效能：${escapeHtml(m.effect)}`);
    if (m.indications) chips.push(`適應症：${escapeHtml(m.indications)}`);
    const url = m.sourceUrl ? `<a href="${escapeAttr(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">官方頁</a>` : '';
    return `<div class="formula-genie-source formula-genie-official-source">衛福部基準方劑${chips.length ? '｜' + chips.join('｜') : ''}${url ? '｜' + url : ''}</div>`;
  }

  function renderResult(payload) {
    const resultEl = $('formulaGenieResult');
    if (!resultEl) return;
    const { features, formulas } = payload;
    if (!features.length) {
      resultEl.innerHTML = '<div class="formula-genie-empty">沒有抽到明確特徵。請輸入較具體的症狀、病機或方證線索，例如「風寒襲肺 咳嗽 痰白 惡寒」。</div>';
      return;
    }

    const renderFeaturePill = ([f, w]) => `<span class="formula-genie-pill">${escapeHtml(f)} <b>${Number(w).toFixed(2)}</b></span>`;
    const mainFeatures = features.slice(0, 5).map(renderFeaturePill).join('');
    const extraFeatures = features.slice(5).map(renderFeaturePill).join('');
    const featureMoreHtml = features.length > 5
      ? `<details class="formula-genie-more">
          <summary>顯示其餘 ${features.length - 5} 個特徵</summary>
          <div class="formula-genie-more-body">${extraFeatures}</div>
        </details>`
      : '';
    const featureHtml = `<div class="formula-genie-feature-box">
      <div class="formula-genie-feature-head">
        <strong>輸入線索</strong>
        <span class="formula-genie-feature-count">先顯示前 5 個</span>
      </div>
      <div>${mainFeatures}</div>
      ${featureMoreHtml}
    </div>`;

    const topScore = formulas[0]?.score || 0;
    const renderEvidence = (x) => {
      const matched = Array.isArray(x.matched) ? x.matched : [];
      if (!matched.length) {
        return `<details class="formula-genie-evidence"><summary>命中特徵與權重</summary><div class="formula-genie-evidence-empty">此候選主要來自同類線索弱匹配，沒有明確逐項命中特徵。</div></details>`;
      }
      const rows = matched.slice(0, 16).map(m => `<tr>
        <td>${escapeHtml(m.feature)}</td>
        <td>${Number(m.inputWeight).toFixed(2)}</td>
        <td>${Number(m.rowWeight).toFixed(2)}</td>
        <td>${Number(m.contribution).toFixed(3)}</td>
      </tr>`).join('');
      const more = matched.length > 16 ? `<div class="formula-genie-evidence-note">尚有 ${matched.length - 16} 個低權重命中特徵未列出。</div>` : '';
      return `<details class="formula-genie-evidence">
        <summary>命中特徵與權重（${matched.length}）</summary>
        <div class="formula-genie-evidence-table-wrap">
          <table class="formula-genie-evidence-table">
            <thead><tr><th>特徵</th><th>輸入權重</th><th>題庫權重</th><th>貢獻</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          ${more}
        </div>
      </details>`;
    };
    const renderCard = (x, i) => {
      const rel = topScore ? Math.max(0, Math.min(100, (x.score / topScore) * 100)) : 0;
      const cls = confidenceLabel(x.score, topScore);
      const prompt = x.row?.prompt || '';
      return `<article class="formula-genie-result-card">
        <div class="formula-genie-rank">${i + 1}</div>
        <div class="formula-genie-result-main">
          <div class="formula-genie-result-title">${escapeHtml(x.label)}</div>
          <div class="formula-genie-result-meta">接近度：${x.score.toFixed(3)}｜相對最高分 ${rel.toFixed(0)}%｜信心：${cls}｜命中特徵 ${x.exact}</div>
          <div class="formula-genie-source">來源題：${escapeHtml(x.row?.id || '')}${prompt ? '｜' + escapeHtml(prompt) : ''}</div>
          ${renderMohwMeta(x.row)}
          ${renderEvidence(x)}
        </div>
      </article>`;
    };

    let itemHtml = '<div class="formula-genie-empty">未找到可排序候選。</div>';
    if (formulas.length) {
      const firstFive = formulas.slice(0, 5).map(renderCard).join('');
      const rest = formulas.slice(5).map((x, idx) => renderCard(x, idx + 5)).join('');
      itemHtml = firstFive + (formulas.length > 5
        ? `<details class="formula-genie-more">
            <summary>顯示第 6 名以後的 ${formulas.length - 5} 個候選</summary>
            <div class="formula-genie-more-body formula-genie-result-list">${rest}</div>
          </details>`
        : '');
    }

    const diagnosticHtml = renderDiagnosticAdvice(payload);
    resultEl.innerHTML = `${featureHtml}${diagnosticHtml}<div class="formula-genie-result-list">${itemHtml}</div>`;
  }
  async function runMatch() {
    const input = $('formulaGenieInput');
    const resultEl = $('formulaGenieResult');
    const limit = Number($('formulaGenieLimit')?.value || 10);
    const prompt = input?.value || '';
    if (!normText(prompt)) {
      if (resultEl) resultEl.innerHTML = '<div class="formula-genie-empty">請先輸入症狀、方證或題幹敘述。</div>';
      return;
    }
    if (resultEl) resultEl.innerHTML = '<div class="formula-genie-loading">方劑精靈正在比對題庫特徵…</div>';
    try {
      await loadData();
      renderResult(directMatch(prompt, Math.max(3, Math.min(20, limit || 10))));
    } catch (err) {
      if (resultEl) resultEl.innerHTML = `<div class="formula-genie-empty">資料載入失敗：${escapeHtml(err?.message || err)}</div>`;
    }
  }
  function bind() {
    const details = $('formulaGenieDetails');
    details?.addEventListener('toggle', () => {
      if (details.open) loadData().catch(() => undefined);
    });
    $('formulaGenieRunBtn')?.addEventListener('click', runMatch);
    $('formulaGenieInput')?.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runMatch();
    });
    $('formulaGenieClearBtn')?.addEventListener('click', () => {
      const input = $('formulaGenieInput');
      if (input) input.value = '';
      const resultEl = $('formulaGenieResult');
      if (resultEl) resultEl.innerHTML = '<div class="formula-genie-empty">已清空。輸入症狀敘述後按「揣測方劑」。</div>';
    });
    $('formulaGenieSampleBtn')?.addEventListener('click', () => {
      const input = $('formulaGenieInput');
      if (input) input.value = '外感風寒，惡寒發熱，咳嗽痰白，鼻塞流清涕，舌苔薄白，脈浮緊';
      runMatch();
    });
    $('formulaGenieDemoBtn')?.addEventListener('click', () => {
      const input = $('formulaGenieInput');
      const idx = Number(input?.dataset?.demoIndex || 0) % DEMO_CASES_V050.length;
      const tc = DEMO_CASES_V050[idx];
      if (input) {
        input.value = tc.input;
        input.dataset.demoIndex = String(idx + 1);
      }
      runMatch();
    });
    renderStatus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  window.FormulaGenieMatcher = { loadData, runMatch, directMatch: (prompt, limit = 10) => directMatch(prompt, limit), demoCases: DEMO_CASES_V050, extractFeatures };
})();
