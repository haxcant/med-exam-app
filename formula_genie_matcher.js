(() => {
  'use strict';

  const DATA_SRC = './formula_genie_data.js?v=20260427fgenie1';
  const DATA_GLOBAL = 'FORMULA_VECTOR_WEIGHTS_V015';
  const state = { loading: false, loaded: false, error: null, rows: [] };

  const BROAD_STOP = new Set('氣血陰陽寒熱虛實痰濕水火風毒瘀痛口肺脾胃腎肝心膽腸尿'.split('').concat(['小便','大便','裡','表','上','中','下','脈','身','口','氣','血','熱','寒','虛','實']));
  const COARSE_AXIS_FEATURES = new Set(['寒','熱','虛','實','表','裡','濕','痰','瘀','水','火','燥','風','毒','肺','脾','胃','腎','肝','心','膽','腸','膀胱','上焦','中焦','下焦','咳','喘','痛','口','小便','大便','黃疸','消渴','癃閉','不寐','痿證','厥證']);

  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
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
  function featureClass(feature, cls) {
    if (cls) return cls;
    const x = String(feature || '');
    if (COARSE_AXIS_FEATURES.has(x) || x.length <= 2) return 'broad';
    if (x.length >= 5) return 'signature';
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
  function rowStrength(rowFeatures, feature, prompt) {
    let best = Number((rowFeatures || {})[feature] || 0);
    const t = normText(prompt);
    if (feature.length >= 2 && t.includes(feature)) best = Math.max(best, feature.length >= 4 ? 2.8 : 0.8);
    for (const [f, w] of Object.entries(rowFeatures || {})) {
      if (feature !== f && (String(f).includes(feature) || String(feature).includes(f))) best = Math.max(best, Number(w) * 0.55);
    }
    return best;
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
    const feats = extractFeatures(prompt);
    const qTop = topFeatures(feats, 30);
    const rowScores = rows.map(row => {
      let score = 0;
      let exact = 0;
      for (const [f, w] of qTop) {
        const rw = rowStrength(row.features || {}, f, row.prompt || '');
        if (rw > 0) {
          score += Math.sqrt(Number(w) * rw) * (f.length >= 6 ? 1.35 : f.length >= 4 ? 1.12 : 0.7);
          exact += 1;
        } else if (featureFamily(f) && Object.keys(row.features || {}).some(rf => featureFamily(rf) === featureFamily(f))) {
          score += 0.03 * Number(w);
        }
      }
      return { row, label: row.__label, score, exact };
    }).sort((a, b) => b.score - a.score || String(a.label).localeCompare(String(b.label)));

    const formulaBest = new Map();
    for (const x of rowScores) {
      if (!x.label) continue;
      if (!formulaBest.has(x.label) || x.score > formulaBest.get(x.label).score) formulaBest.set(x.label, x);
    }
    const formulas = Array.from(formulaBest.values()).sort((a, b) => b.score - a.score).slice(0, limit);
    return { features: qTop, formulas };
  }
  function confidenceLabel(score, topScore) {
    if (!topScore || score <= 0) return '低';
    const r = score / topScore;
    if (r >= 0.92) return '高';
    if (r >= 0.70) return '中';
    return '低';
  }
  function renderResult(payload) {
    const resultEl = $('formulaGenieResult');
    if (!resultEl) return;
    const { features, formulas } = payload;
    if (!features.length) {
      resultEl.innerHTML = '<div class="formula-genie-empty">沒有抽到明確特徵。請輸入較具體的症狀、病機或方證線索，例如「風寒襲肺 咳嗽 痰白 惡寒」。</div>';
      return;
    }
    const topScore = formulas[0]?.score || 0;
    const featureHtml = features.slice(0, 18).map(([f, w]) => `<span class="formula-genie-pill">${escapeHtml(f)} <b>${Number(w).toFixed(2)}</b></span>`).join('');
    const itemHtml = formulas.length ? formulas.map((x, i) => {
      const rel = topScore ? Math.max(0, Math.min(100, (x.score / topScore) * 100)) : 0;
      const cls = confidenceLabel(x.score, topScore);
      const prompt = x.row?.prompt || '';
      return `<article class="formula-genie-result-card">
        <div class="formula-genie-rank">${i + 1}</div>
        <div class="formula-genie-result-main">
          <div class="formula-genie-result-title">${escapeHtml(x.label)}</div>
          <div class="formula-genie-result-meta">接近度：${x.score.toFixed(3)}｜相對最高分 ${rel.toFixed(0)}%｜信心：${cls}｜命中特徵 ${x.exact}</div>
          <div class="formula-genie-source">來源題：${escapeHtml(x.row?.id || '')}${prompt ? '｜' + escapeHtml(prompt) : ''}</div>
        </div>
      </article>`;
    }).join('') : '<div class="formula-genie-empty">未找到可排序候選。</div>';

    resultEl.innerHTML = `<div class="formula-genie-feature-box"><strong>抽取特徵</strong><div>${featureHtml}</div></div><div class="formula-genie-result-list">${itemHtml}</div>`;
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
    renderStatus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  window.FormulaGenieMatcher = { loadData, runMatch, directMatch: (prompt, limit = 10) => directMatch(prompt, limit) };
})();
