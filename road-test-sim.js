(function () {
  'use strict';

  const STORAGE_KEYS = {
    youtubeUrl: 'roadTest.youtubeUrl',
    lastSegmentId: 'roadTest.lastSegmentId',
    moduleFilter: 'roadTest.moduleFilter',
    muted: 'roadTest.muted',
    autoplayNav: 'roadTest.autoplayNav',
    autoAdvance: 'roadTest.autoAdvance',
    advanceDelaySec: 'roadTest.advanceDelaySec',
    roadPanelOpen: 'roadTest.roadPanelOpen',
    infoPanelOpen: 'roadTest.infoPanelOpen',
    configPanelOpen: 'roadTest.configPanelOpen',
    chainPanelOpen: 'roadTest.chainPanelOpen',
    chainCompletedOpen: 'roadTest.chainCompletedOpen'
  };

  const DEFAULT_URL = 'https://www.youtube.com/watch?v=ldsprS-5Y9E';
  const DEFAULT_SETTINGS = { muted: true, autoplayNav: true, autoAdvance: true, advanceDelaySec: 0.5 };
  const SIM_THRESHOLD = 0.6;

  function qs(id) { return document.getElementById(id); }
  function safeText(v) { return String(v == null ? '' : v).trim(); }
  function readBool(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : raw === 'true';
  }
  function readNumber(key, fallback, min, max) {
    const raw = Number(localStorage.getItem(key));
    if (!Number.isFinite(raw)) return fallback;
    return Math.min(max, Math.max(min, raw));
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }
  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function standardizeRoadText(text) {
    let t = safeText(text)
      .replace(/【?油量、?溫度、?引擎、?電瓶、?手煞車燈、?機油\s*正常】?/g, '（溫度、油量、煞車、充電、機油）正常')
      .replace(/【?開啟紅火[:：]?/g, '')
      .replace(/觀察儀表/g, '檢查儀表')
      .replace(/\s+/g, ' ')
      .trim();
    if (/儀表/.test(t) && /(溫度|油量|煞車|充電|機油)/.test(t)) {
      t = t.replace(/（?溫度、油量、煞車、充電、機油）?正常/g, '（溫度、油量、煞車、充電、機油）正常');
    }
    return t;
  }

  function displayTextForQuestion(question) {
    const a = standardizeRoadText(question && question.answerText || '');
    const c = standardizeRoadText(question && question.captionText || '');
    if (!a) return c || '（無文字）';
    if (!c) return a || '（無文字）';
    return c.length > a.length ? c : a;
  }

  function normalizeAnswerText(text) {
    return standardizeRoadText(text)
      .replace(/[【】「」『』（）()，,。；;：:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function canonicalAnswerText(text) {
    return normalizeAnswerText(text)
      .replace(/再次|再度|先|再|後|然後|並|且|注意|留意|請|口誦|本次|這一步|目前|進行/g, '')
      .replace(/前方路口|通過路口前|到路口前|到紅綠燈前/g, '路口')
      .replace(/左右無來車|後方無來車/g, '無來車')
      .replace(/轉頭察看|轉頭查看|察看|查看/g, '查看')
      .replace(/照後鏡|後照鏡/g, '照後鏡')
      .replace(/切入主線道|切回主線道/g, '變換車道')
      .replace(/打左邊方向燈|打左方向燈/g, '左方向燈')
      .replace(/打右邊方向燈|打右方向燈/g, '右方向燈')
      .replace(/\s+/g, '')
      .trim();
  }

  function buildBigrams(text) {
    const s = canonicalAnswerText(text);
    const grams = new Set();
    if (!s) return grams;
    if (s.length === 1) { grams.add(s); return grams; }
    for (let i = 0; i < s.length - 1; i += 1) grams.add(s.slice(i, i + 2));
    return grams;
  }

  function textSimilarity(a, b) {
    const ca = canonicalAnswerText(a);
    const cb = canonicalAnswerText(b);
    if (!ca || !cb) return 0;
    if (ca === cb) return 1;
    if (ca.includes(cb) || cb.includes(ca)) return 0.95;
    const ga = buildBigrams(ca);
    const gb = buildBigrams(cb);
    let inter = 0;
    ga.forEach((g) => { if (gb.has(g)) inter += 1; });
    return inter / Math.max(ga.size || 1, gb.size || 1);
  }

  function detectAnswerFamily(text) {
    const t = canonicalAnswerText(text);
    if (!t) return 'unknown';
    if (/胎紋|胎壓|輪胎/.test(t)) return 'tire_check';
    if (/車燈|破損/.test(t)) return 'light_check';
    if (/車底無異物/.test(t)) return 'undercarriage_check';
    if (/兩段式開車門|開車門/.test(t)) return 'door_check';
    if (/調整座椅|調整椅背|調整頭枕/.test(t)) return 'seat_adjust';
    if (/安全帶/.test(t)) return 'seatbelt';
    if (/檢查儀表|溫度油量煞車充電機油/.test(t)) return 'instrument_check';
    if (/試踩煞車|煞車正常/.test(t)) return 'brake_check';
    if (/試打方向燈|方向燈正常/.test(t)) return 'signal_check';
    if (/起步|起駛|準備起步/.test(t)) return 'start_sequence';
    if (/路邊臨時停車完畢|路邊臨時停車/.test(t)) return 'roadside_stop';
    if (/變換車道|切入主線|切回主線/.test(t)) return 'lane_change';
    if (/迴轉/.test(t)) return 'u_turn';
    if (/路口|左右無來車/.test(t)) return 'intersection_scan';
    if (/不要壓到|車道線間距|車道線|直線路段/.test(t)) return 'lane_keeping';
    if (/熄火|解開安全帶|椅子退後|下車/.test(t)) return 'finish_stop';
    return 'unknown';
  }

  function isQuizworthyText(text) {
    const t = safeText(text);
    if (!t) return false;
    return !/(歡迎|駕訓班|TOYOTA|本班|介紹親友|良好學習環境|今天示範的也是新車|影片介紹到這裡|謝謝大家|再見|車棚|颱風|大雨考試|用心)/.test(t);
  }

  function isChainLowSignal(question) {
    const text = safeText(question.answerText || question.captionText || '');
    if (!text) return true;
    if (/(B柱|45度|視線死角|恭喜拿到駕照|發動後先開冷氣|燈號熄滅代表正常)/.test(text)) return true;
    const family = detectAnswerFamily(text);
    return family === 'lane_keeping';
  }

  function isAmbiguousDistractor(correctQuestion, candidateQuestion) {
    const correctText = safeText(correctQuestion.answerText || correctQuestion.captionText || '');
    const candidateText = safeText(candidateQuestion.answerText || candidateQuestion.captionText || '');
    if (!candidateText) return true;
    const cf = detectAnswerFamily(correctText);
    const df = detectAnswerFamily(candidateText);
    if (cf === df && cf !== 'unknown') return true;
    return textSimilarity(correctText, candidateText) >= SIM_THRESHOLD;
  }

  function extractYouTubeVideoId(url) {
    const text = safeText(url);
    if (!text) return '';
    try {
      const parsed = new URL(text);
      if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace(/^\//, '').trim();
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v').trim();
      const parts = parsed.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('embed');
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].trim();
    } catch (_) {
      const m = text.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
      if (m) return m[1];
    }
    return '';
  }

  function buildEmbedUrl(videoId, startSec, endSec, autoplay, muted) {
    if (!videoId) return '';
    const start = Math.max(0, Math.floor(Number(startSec) || 0));
    const end = Math.max(start + 1, Math.floor(Number(endSec) || 0));
    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?start=${start}&end=${end}&autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&rel=0&playsinline=1&modestbranding=1&controls=1`;
  }

  function buildWatchUrl(videoId, startSec) {
    if (!videoId) return DEFAULT_URL;
    const start = Math.max(0, Math.floor(Number(startSec) || 0));
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${start}s`;
  }

  function buildQuestionBank(ref) {
    const modules = new Map((ref.modules || []).map((m) => [m.id, { ...m, summary: standardizeRoadText(m.summary || '') }]));
    return (ref.segments || [])
      .filter((seg) => isQuizworthyText(seg.answerText || seg.captionText || ''))
      .map((seg, idx) => {
        const mod = modules.get(seg.moduleId) || {};
        const answerText = standardizeRoadText(seg.answerText || seg.captionText || '');
        const captionText = standardizeRoadText(seg.captionText || answerText);
        const startSec = Number(seg.startSec) || 0;
        const endSec = Number(seg.endSec) || startSec;
        const lead = Number(seg.clipLeadSeconds ?? ref.defaults?.clipLeadSeconds ?? 1) || 1;
        const lag = Number(seg.clipLagSeconds ?? ref.defaults?.clipLagSeconds ?? 1) || 1;
        return {
          bankId: `RT-${String(idx + 1).padStart(3, '0')}`,
          segmentId: seg.id || `seg-${idx + 1}`,
          moduleId: seg.moduleId || 'unknown',
          moduleTitle: mod.title || '未分類模組',
          moduleSummary: safeText(mod.summary || ''),
          prompt: '依影片字幕與畫面，這一步最正確的作法是？',
          answerText,
          captionText,
          startSec,
          endSec,
          clipLeadSeconds: lead,
          clipLagSeconds: lag,
          clipStartSec: Number(seg.clipStartSec) || Math.max(0, startSec - lead),
          clipEndSec: Number(seg.clipEndSec) || Math.max(startSec + 1, endSec + lag),
          tags: Array.isArray(seg.tags) ? seg.tags.slice() : []
        };
      });
  }

  function createState(ref) {
    const questionBank = buildQuestionBank(ref);
    const modules = Array.isArray(ref.modules) ? ref.modules.map((m) => ({ ...m, summary: standardizeRoadText(m.summary || '') })) : [];
    return {
      ref,
      questionBank,
      modules,
      filteredQuestions: questionBank.slice(),
      currentIndex: 0,
      currentQuestion: null,
      currentUrl: '',
      currentVideoId: '',
      pendingAdvanceTimer: null,
      answered: false,
      mcq: null,
      settings: {
        muted: readBool(STORAGE_KEYS.muted, DEFAULT_SETTINGS.muted),
        autoplayNav: readBool(STORAGE_KEYS.autoplayNav, DEFAULT_SETTINGS.autoplayNav),
        autoAdvance: readBool(STORAGE_KEYS.autoAdvance, DEFAULT_SETTINGS.autoAdvance),
        advanceDelaySec: readNumber(STORAGE_KEYS.advanceDelaySec, DEFAULT_SETTINGS.advanceDelaySec, 0.5, 5)
      },
      chain: {
        startIndex: 0,
        currentIndex: 0,
        usable: []
      }
    };
  }

  function clearPendingAdvance(state) {
    if (state.pendingAdvanceTimer) {
      clearTimeout(state.pendingAdvanceTimer);
      state.pendingAdvanceTimer = null;
    }
    const exam = qs('roadTestExamStatus');
    if (exam) exam.textContent = '';
  }

  function updateHeaderMeta(state) {
    const bankMeta = qs('roadTestBankMeta');
    const flowHint = qs('roadTestFlowHint');
    const usageNote = qs('roadTestUsageNote');
    const versionNote = qs('roadTestVersionNote');
    const sourceLabel = qs('roadTestSourceLabel');
    if (bankMeta) bankMeta.textContent = `已編成題庫 ${state.questionBank.length} 題，共 ${state.modules.length} 類模組；目前篩選後 ${state.filteredQuestions.length} 題。`;
    if (flowHint) flowHint.textContent = `目前設定：${state.settings.muted ? '靜音' : '開聲'}｜${state.settings.autoplayNav ? '切題自動播放' : '切題手動播放'}｜${state.settings.autoAdvance ? `答題後 ${state.settings.advanceDelaySec.toFixed(1)} 秒自動跳題` : '答題後停留本題'}`;
    if (usageNote) usageNote.textContent = '使用說明：上方四選一先看主影片；下方字幕接龍共用同一題庫，根據目前這一步選緊接的下一題。';
    if (versionNote) versionNote.textContent = '版本資訊：RoadTest UI v21.6｜整理完整基準包，修正字幕接龍切換、顯示與累積邏輯。';
    if (sourceLabel) sourceLabel.textContent = '影片來源：YouTube｜字幕來源：captions.sbv｜片段前後各 1 秒';
  }

  function syncSettingControls(state) {
    const muted = qs('roadTestMutedToggle');
    const autoplay = qs('roadTestAutoplayNextToggle');
    const autoAdvance = qs('roadTestAutoAdvanceToggle');
    const delayInput = qs('roadTestAdvanceDelayInput');
    if (muted) muted.checked = !!state.settings.muted;
    if (autoplay) autoplay.checked = !!state.settings.autoplayNav;
    if (autoAdvance) autoAdvance.checked = !!state.settings.autoAdvance;
    if (delayInput) delayInput.value = String(state.settings.advanceDelaySec);
  }

  function populateModuleSelect(state) {
    const select = qs('roadTestModuleSelect');
    if (!select) return;
    const lastValue = localStorage.getItem(STORAGE_KEYS.moduleFilter) || 'all';
    select.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = `全部模組（${state.modules.length} 類）`;
    select.appendChild(allOpt);
    state.modules.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.title || m.id;
      select.appendChild(opt);
    });
    select.value = Array.from(select.options).some((o) => o.value === lastValue) ? lastValue : 'all';
  }

  function buildOptionsForQuestion(question, state) {
    const correct = standardizeRoadText(question.answerText || question.captionText || '');
    const correctNorm = normalizeAnswerText(correct);
    const otherModules = shuffle(state.questionBank.filter((q) => q.segmentId !== question.segmentId && q.moduleId !== question.moduleId));
    const sameModule = shuffle(state.questionBank.filter((q) => q.segmentId !== question.segmentId && q.moduleId === question.moduleId));
    const allOthers = shuffle(state.questionBank.filter((q) => q.segmentId !== question.segmentId));
    const picked = [];
    const used = new Set([correctNorm]);

    function tryAdd(candidate) {
      if (!candidate || isAmbiguousDistractor(question, candidate)) return false;
      const text = standardizeRoadText(candidate.answerText || candidate.captionText || '');
      const norm = normalizeAnswerText(text);
      if (!text || !norm || used.has(norm)) return false;
      used.add(norm);
      picked.push(text);
      return true;
    }

    otherModules.forEach((q) => { if (picked.length < 3) tryAdd(q); });
    sameModule.forEach((q) => { if (picked.length < 3) tryAdd(q); });
    allOthers.forEach((q) => { if (picked.length < 3) tryAdd(q); });

    const fallbackPool = [
      '檢查儀表（溫度、油量、煞車、充電、機油）正常',
      '繫好安全帶並確認檔位在 P 檔',
      '兩段式開車門並確認左右安全',
      '前方路口減速查看並確認左右無來車',
      '打方向燈後確認後方安全再變換車道'
    ];
    fallbackPool.forEach((text) => {
      if (picked.length >= 3) return;
      const norm = normalizeAnswerText(text);
      if (norm && !used.has(norm) && textSimilarity(correct, text) < SIM_THRESHOLD) {
        used.add(norm);
        picked.push(text);
      }
    });

    const options = shuffle([correct, ...picked.slice(0, 3)]);
    return {
      correctText: correct,
      correctNorm,
      options,
      correctIndex: options.findIndex((o) => normalizeAnswerText(o) === correctNorm)
    };
  }

  function setEmptyState(state, message) {
    const empty = qs('roadTestEmpty');
    const wrap = qs('roadTestQuestionWrap');
    if (empty) {
      empty.classList.remove('hidden');
      empty.textContent = message;
    }
    if (wrap) wrap.classList.add('hidden');
    updateVideoForQuestion(state, null, false);
  }

  function updateVideoForQuestion(state, question, autoplay) {
    const iframe = qs('roadTestVideoFrame');
    const openBtn = qs('roadTestOpenYoutubeBtn');
    const status = qs('roadTestVideoStatus');
    if (!iframe) return;
    if (!question) {
      iframe.src = '';
      if (status) status.textContent = '尚未播放片段。';
      if (openBtn) openBtn.href = DEFAULT_URL;
      return;
    }
    if (!state.currentVideoId) {
      iframe.src = '';
      if (status) status.textContent = '尚未填入可用的 YouTube 網址。';
      if (openBtn) openBtn.href = DEFAULT_URL;
      return;
    }
    iframe.src = buildEmbedUrl(state.currentVideoId, question.clipStartSec, question.clipEndSec, autoplay, state.settings.muted);
    if (openBtn) openBtn.href = buildWatchUrl(state.currentVideoId, question.clipStartSec);
    if (status) status.textContent = `${question.bankId}｜${formatTime(question.startSec)} - ${formatTime(question.endSec)}｜播放 ${formatTime(question.clipStartSec)} - ${formatTime(question.clipEndSec)}｜${state.settings.muted ? '預設靜音' : '目前開聲'}`;
  }

  function updateChainVideo(state, question, autoplay) {
    const iframe = qs('roadTestChainVideoFrame');
    const label = qs('roadTestChainClipLabel');
    if (!iframe) return;
    if (!question || !state.currentVideoId) {
      iframe.src = '';
      if (label) label.textContent = '尚未載入片段。';
      return;
    }
    iframe.src = buildEmbedUrl(state.currentVideoId, question.clipStartSec, question.clipEndSec, autoplay, state.settings.muted);
    if (label) label.textContent = `${question.bankId}｜${formatTime(question.startSec)} - ${formatTime(question.endSec)}｜播放 ${formatTime(question.clipStartSec)} - ${formatTime(question.clipEndSec)}`;
  }

  function renderCurrentQuestion(state) {
    const wrap = qs('roadTestQuestionWrap');
    const empty = qs('roadTestEmpty');
    const progress = qs('roadTestProgress');
    const prompt = qs('roadTestPrompt');
    const meta = qs('roadTestSegmentMeta');
    const moduleLabel = qs('roadTestModuleLabel');
    const optionsEl = qs('roadTestOptions');
    const feedback = qs('roadTestFeedback');
    const answerBox = qs('roadTestAnswerBox');
    const answerText = qs('roadTestAnswerText');
    const answerBtn = qs('roadTestShowAnswerBtn');
    const referenceNote = qs('roadTestReferenceNote');
    if (!wrap || !empty || !progress || !prompt || !meta || !moduleLabel || !optionsEl || !feedback || !answerBox || !answerText || !answerBtn || !referenceNote) return;

    const question = state.currentQuestion;
    if (!question) {
      setEmptyState(state, '目前沒有可用的路考題。');
      return;
    }

    empty.classList.add('hidden');
    wrap.classList.remove('hidden');
    progress.textContent = `第 ${state.currentIndex + 1} / ${state.filteredQuestions.length} 題`;
    prompt.textContent = question.prompt;
    meta.textContent = `${question.bankId}｜字幕 ${formatTime(question.startSec)} - ${formatTime(question.endSec)}｜模組重點：${question.moduleSummary || question.moduleTitle}`;
    moduleLabel.textContent = question.moduleTitle || '模組';
    feedback.textContent = '';
    feedback.className = 'roadtest-feedback';
    answerBox.classList.add('hidden');
    answerText.textContent = standardizeRoadText(question.captionText || question.answerText || '');
    answerBtn.textContent = '顯示字幕答案';
    referenceNote.textContent = `題庫編碼 ${question.bankId}｜字幕答案供對照；本題為四選一。`;

    const mcq = buildOptionsForQuestion(question, state);
    state.mcq = mcq;
    state.answered = false;
    optionsEl.innerHTML = '';
    mcq.options.forEach((text, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'roadtest-option-btn';
      btn.innerHTML = `<span class="roadtest-option-index">${idx + 1}</span><span class="roadtest-option-text">${standardizeRoadText(text) || '（無文字）'}</span>`;
      btn.addEventListener('click', () => submitAnswer(state, idx));
      optionsEl.appendChild(btn);
    });

    updateVideoForQuestion(state, question, false);
  }

  function submitAnswer(state, chosenIndex) {
    if (state.answered || !state.mcq || !state.currentQuestion) return;
    state.answered = true;
    clearPendingAdvance(state);

    const optionsEl = qs('roadTestOptions');
    const feedback = qs('roadTestFeedback');
    if (!optionsEl || !feedback) return;
    const buttons = Array.from(optionsEl.querySelectorAll('button'));
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === state.mcq.correctIndex) btn.classList.add('correct');
      if (idx === chosenIndex && idx !== state.mcq.correctIndex) btn.classList.add('incorrect');
    });

    const correct = chosenIndex === state.mcq.correctIndex;
    feedback.textContent = correct ? '答對。' : `答錯，正確答案是：${state.mcq.correctText}`;
    feedback.className = `roadtest-feedback ${correct ? 'is-correct' : 'is-wrong'}`;

    if (state.settings.autoAdvance) {
      const exam = qs('roadTestExamStatus');
      if (exam) exam.textContent = `${state.settings.advanceDelaySec.toFixed(1)} 秒後自動前往下一題…`;
      state.pendingAdvanceTimer = setTimeout(() => {
        moveToIndex(state, state.currentIndex + 1, { autoplay: state.settings.autoplayNav });
      }, state.settings.advanceDelaySec * 1000);
    }
  }

  function moveToIndex(state, index, opts) {
    clearPendingAdvance(state);
    const list = state.filteredQuestions;
    if (!list.length) {
      state.currentIndex = -1;
      state.currentQuestion = null;
      renderCurrentQuestion(state);
      buildChainQuiz(state, { startIndex: 0 });
      return;
    }
    let nextIndex = index;
    if (!Number.isFinite(nextIndex)) nextIndex = 0;
    if (nextIndex < 0) nextIndex = list.length - 1;
    if (nextIndex >= list.length) nextIndex = 0;
    state.currentIndex = nextIndex;
    state.currentQuestion = list[nextIndex];
    localStorage.setItem(STORAGE_KEYS.lastSegmentId, state.currentQuestion.segmentId);
    renderCurrentQuestion(state);
    updateVideoForQuestion(state, state.currentQuestion, !!(opts && opts.autoplay));
    buildChainQuiz(state, { startIndex: nextIndex < list.length - 1 ? nextIndex : Math.max(0, list.length - 2) });
  }

  function applyFilter(state, moduleId) {
    const selected = safeText(moduleId || 'all') || 'all';
    localStorage.setItem(STORAGE_KEYS.moduleFilter, selected);
    state.filteredQuestions = selected === 'all'
      ? state.questionBank.slice()
      : state.questionBank.filter((q) => q.moduleId === selected);
    updateHeaderMeta(state);
    if (!state.filteredQuestions.length) {
      state.currentIndex = -1;
      state.currentQuestion = null;
      setEmptyState(state, '此模組目前沒有可用題目。');
      buildChainQuiz(state, { startIndex: 0 });
      return;
    }
    const savedSegmentId = localStorage.getItem(STORAGE_KEYS.lastSegmentId);
    const preferredIndex = state.filteredQuestions.findIndex((q) => q.segmentId === savedSegmentId);
    moveToIndex(state, preferredIndex >= 0 ? preferredIndex : 0, { autoplay: false });
  }

  function chainUsableQuestions(state) {
    return state.filteredQuestions.slice();
  }

  function resetChainToIndex(state, index) {
    const usable = chainUsableQuestions(state);
    state.chain.usable = usable;
    if (!usable.length) {
      state.chain.startIndex = 0;
      state.chain.currentIndex = 0;
      renderChain(state);
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, usable.length - 1));
    state.chain.startIndex = safeIndex;
    state.chain.currentIndex = safeIndex;
    renderChain(state);
  }

  function buildChainOptions(state) {
    const usable = state.chain.usable || [];
    const current = usable[state.chain.currentIndex];
    const correct = usable[state.chain.currentIndex + 1];
    if (!current || !correct) return { items: [], correctId: '' };
    const distractors = [];
    const candidates = usable.filter((q, idx) => idx !== state.chain.currentIndex && idx !== state.chain.currentIndex + 1);
    shuffle(candidates).forEach((q) => {
      if (distractors.length >= 3) return;
      if (isAmbiguousDistractor(correct, q)) return;
      distractors.push(q);
    });
    shuffle(candidates).forEach((q) => {
      if (distractors.length >= 3) return;
      if (distractors.some((x) => x.segmentId === q.segmentId)) return;
      distractors.push(q);
    });
    return { options: shuffle([correct, ...distractors.slice(0, 3)]), correctId: correct.segmentId };
  }

  function renderCompletedList(state) {
    const list = qs('roadTestChainCompletedList');
    const resultBox = qs('roadTestChainResultBox');
    const resultText = qs('roadTestChainResultText');
    if (!list || !resultBox || !resultText) return;
    const done = (state.chain.usable || []).slice(state.chain.startIndex, state.chain.currentIndex + 1);
    if (!done.length) {
      list.className = 'roadtest-chain-completed-list empty-state';
      list.textContent = '目前尚未完成任何步驟。';
      resultBox.classList.add('hidden');
      return;
    }
    list.className = 'roadtest-chain-completed-list';
    list.innerHTML = done.map((q, idx) => `<div class="roadtest-chain-completed-item"><span class="roadtest-chain-completed-index">${idx + 1}</span><span>${displayTextForQuestion(q)}</span></div>`).join('');
    resultText.textContent = done.map((q) => displayTextForQuestion(q)).join(' → ');
    resultBox.classList.remove('hidden');
  }

  function renderChain(state) {
    const panel = qs('roadTestChainPanel');
    const meta = qs('roadTestChainMeta');
    const currentText = qs('roadTestChainCurrentText');
    const stepMeta = qs('roadTestChainStepMeta');
    const progress = qs('roadTestChainProgress');
    const qMeta = qs('roadTestChainQuestionMeta');
    const moduleLabel = qs('roadTestChainModuleLabel');
    const optionsEl = qs('roadTestChainNextOptions');
    const feedback = qs('roadTestChainFeedback');
    const resultBox = qs('roadTestChainResultBox');
    const resultText = qs('roadTestChainResultText');
    if (!panel || !meta || !currentText || !stepMeta || !progress || !qMeta || !moduleLabel || !optionsEl || !feedback || !resultBox || !resultText) return;

    const usable = state.chain.usable || [];
    const current = usable[state.chain.currentIndex];
    const nextQ = usable[state.chain.currentIndex + 1];
    meta.textContent = `字幕接龍共用影片考試題庫；目前可用 ${usable.length} 題。`;

    if (!current) {
      currentText.textContent = '目前沒有可用的字幕接龍題。';
      stepMeta.textContent = '';
      progress.textContent = '第 0 / 0 題';
      qMeta.textContent = '';
      moduleLabel.textContent = '字幕接龍';
      optionsEl.innerHTML = '';
      feedback.textContent = '請先選擇有內容的模組。';
      feedback.className = 'roadtest-feedback';
      resultBox.classList.add('hidden');
      updateChainVideo(state, null, false);
      renderCompletedList(state);
      return;
    }

    const currentTextValue = displayTextForQuestion(current);
    currentText.textContent = currentTextValue;
    stepMeta.textContent = `${current.bankId}｜${formatTime(current.startSec)} - ${formatTime(current.endSec)}｜${current.moduleTitle || '字幕接龍'}`;
    progress.textContent = `第 ${state.chain.currentIndex + 1} / ${usable.length} 題`;
    qMeta.textContent = nextQ ? `下一題是什麼？（接在 ${current.bankId} 後）` : '已到題庫最後一題。';
    moduleLabel.textContent = current.moduleTitle || '字幕接龍';
    feedback.textContent = '';
    feedback.className = 'roadtest-feedback';
    resultBox.classList.remove('hidden');
    resultText.textContent = currentTextValue;
    renderCompletedList(state);
    updateChainVideo(state, current, false);

    if (!nextQ) {
      optionsEl.innerHTML = '';
      feedback.textContent = '已到目前題庫最後一題，請切到上一題或隨機一題。';
      feedback.className = 'roadtest-feedback';
      return;
    }

    const built = buildChainOptions(state);
    optionsEl.innerHTML = '';
    built.options.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'roadtest-option-btn';
      btn.dataset.segmentId = q.segmentId;
      btn.innerHTML = `<span class="roadtest-option-index">${idx + 1}</span><span class="roadtest-option-text">${displayTextForQuestion(q)}</span>`;
      btn.addEventListener('click', function () { submitChainAnswer(state, q.segmentId, built.correctId); });
      optionsEl.appendChild(btn);
    });
  }

  function submitChainAnswer(state, chosenId, correctId) {
    const feedback = qs('roadTestChainFeedback');
    const optionsEl = qs('roadTestChainNextOptions');
    if (!feedback || !optionsEl) return;
    const buttons = Array.from(optionsEl.querySelectorAll('button'));
    buttons.forEach((btn) => {
      btn.disabled = true;
      const segId = btn.dataset.segmentId || '';
      if (segId === correctId) btn.classList.add('correct');
      if (segId === chosenId && chosenId !== correctId) btn.classList.add('incorrect');
    });
    if (chosenId === correctId) {
      feedback.textContent = '答對，已接到下一題。';
      feedback.className = 'roadtest-feedback is-correct';
      setTimeout(function () {
        state.chain.currentIndex = Math.min(state.chain.currentIndex + 1, Math.max(0, (state.chain.usable || []).length - 1));
        renderChain(state);
      }, 360);
    } else {
      feedback.textContent = '答錯，這不是緊接的下一題。';
      feedback.className = 'roadtest-feedback is-wrong';
      setTimeout(function () { renderChain(state); }, 520);
    }
  }

  function buildChainQuiz(state, opts) {
    const usable = chainUsableQuestions(state);
    state.chain.usable = usable;
    if (!usable.length) {
      state.chain.startIndex = 0;
      state.chain.currentIndex = 0;
      renderChain(state);
      return;
    }
    let startIndex = opts && Number.isInteger(opts.startIndex) ? opts.startIndex : (Number.isInteger(state.currentIndex) ? state.currentIndex : 0);
    const maxStart = Math.max(0, usable.length - 1);
    if (opts && opts.random && maxStart > 0) startIndex = Math.floor(Math.random() * (maxStart + 1));
    startIndex = Math.max(0, Math.min(startIndex, maxStart));
    state.chain.startIndex = startIndex;
    state.chain.currentIndex = startIndex;
    renderChain(state);
  }

  function moveChainWindow(state, delta, randomPick) {
    const usable = state.chain.usable || chainUsableQuestions(state);
    const maxStart = Math.max(0, usable.length - 1);
    if (!usable.length) {
      buildChainQuiz(state, { startIndex: 0 });
      return;
    }
    let next = Number.isInteger(state.chain.currentIndex) ? state.chain.currentIndex : 0;
    if (randomPick) next = Math.floor(Math.random() * (maxStart + 1));
    else next = (next + delta + (maxStart + 1)) % (maxStart + 1);
    resetChainToIndex(state, next);
  }

  function applyPanelOpenStates() {
    const roadDetails = qs('roadTestDetails');
    const infoDetails = qs('roadTestInfoDetails');
    const configDetails = qs('roadTestConfigDetails');
    const chainDetails = qs('roadTestChainDetails');
    const chainCompleted = qs('roadTestChainCompletedDetails');
    if (roadDetails) {
      roadDetails.open = readBool(STORAGE_KEYS.roadPanelOpen, true);
      roadDetails.addEventListener('toggle', function () { localStorage.setItem(STORAGE_KEYS.roadPanelOpen, String(roadDetails.open)); });
    }
    if (infoDetails) {
      infoDetails.open = readBool(STORAGE_KEYS.infoPanelOpen, true);
      infoDetails.addEventListener('toggle', function () { localStorage.setItem(STORAGE_KEYS.infoPanelOpen, String(infoDetails.open)); });
    }
    if (configDetails) {
      configDetails.open = readBool(STORAGE_KEYS.configPanelOpen, false);
      configDetails.addEventListener('toggle', function () { localStorage.setItem(STORAGE_KEYS.configPanelOpen, String(configDetails.open)); });
    }
    if (chainDetails) {
      chainDetails.open = readBool(STORAGE_KEYS.chainPanelOpen, true);
      chainDetails.addEventListener('toggle', function () { localStorage.setItem(STORAGE_KEYS.chainPanelOpen, String(chainDetails.open)); });
    }
    if (chainCompleted) {
      chainCompleted.open = readBool(STORAGE_KEYS.chainCompletedOpen, false);
      chainCompleted.addEventListener('toggle', function () { localStorage.setItem(STORAGE_KEYS.chainCompletedOpen, String(chainCompleted.open)); });
    }
  }

  function bindEvents(state) {
    const urlInput = qs('roadTestYoutubeUrlInput');
    const saveUrlBtn = qs('roadTestSaveUrlBtn');
    const useDefaultBtn = qs('roadTestUseDefaultBtn');
    const playBtn = qs('roadTestPlayClipBtn');
    const prevBtn = qs('roadTestPrevBtn');
    const nextBtn = qs('roadTestNextBtn');
    const randomBtn = qs('roadTestRandomBtn');
    const moduleSelect = qs('roadTestModuleSelect');
    const answerToggle = qs('roadTestShowAnswerBtn');
    const mutedToggle = qs('roadTestMutedToggle');
    const autoplayToggle = qs('roadTestAutoplayNextToggle');
    const autoAdvanceToggle = qs('roadTestAutoAdvanceToggle');
    const delayInput = qs('roadTestAdvanceDelayInput');
    const chainRefreshBtn = qs('roadTestChainRefreshBtn');
    const chainPrevBtn = qs('roadTestChainPrevBtn');
    const chainNextBtn = qs('roadTestChainNextBtn');
    const chainRandomBtn = qs('roadTestChainRandomBtn');
    const chainPlayBtn = qs('roadTestChainPlayBtn');

    if (saveUrlBtn && urlInput) {
      saveUrlBtn.addEventListener('click', function () {
        const value = safeText(urlInput.value) || DEFAULT_URL;
        state.currentUrl = value;
        state.currentVideoId = extractYouTubeVideoId(value);
        localStorage.setItem(STORAGE_KEYS.youtubeUrl, value);
        updateVideoForQuestion(state, state.currentQuestion, false);
        updateChainVideo(state, (state.chain.usable || [])[state.chain.currentIndex], false);
      });
    }
    if (useDefaultBtn && urlInput) {
      useDefaultBtn.addEventListener('click', function () {
        urlInput.value = DEFAULT_URL;
        state.currentUrl = DEFAULT_URL;
        state.currentVideoId = extractYouTubeVideoId(DEFAULT_URL);
        localStorage.setItem(STORAGE_KEYS.youtubeUrl, DEFAULT_URL);
        updateVideoForQuestion(state, state.currentQuestion, false);
        updateChainVideo(state, (state.chain.usable || [])[state.chain.currentIndex], false);
      });
    }
    if (playBtn) playBtn.addEventListener('click', function () { updateVideoForQuestion(state, state.currentQuestion, true); });
    if (prevBtn) prevBtn.addEventListener('click', function () { moveToIndex(state, state.currentIndex - 1, { autoplay: state.settings.autoplayNav }); });
    if (nextBtn) nextBtn.addEventListener('click', function () { moveToIndex(state, state.currentIndex + 1, { autoplay: state.settings.autoplayNav }); });
    if (randomBtn) randomBtn.addEventListener('click', function () { moveToIndex(state, Math.floor(Math.random() * Math.max(1, state.filteredQuestions.length)), { autoplay: state.settings.autoplayNav }); });
    if (moduleSelect) moduleSelect.addEventListener('change', function () { applyFilter(state, moduleSelect.value); });
    if (answerToggle) {
      answerToggle.addEventListener('click', function () {
        const box = qs('roadTestAnswerBox');
        if (!box) return;
        const willShow = box.classList.contains('hidden');
        box.classList.toggle('hidden', !willShow);
        answerToggle.textContent = willShow ? '隱藏字幕答案' : '顯示字幕答案';
      });
    }
    if (mutedToggle) mutedToggle.addEventListener('change', function () {
      state.settings.muted = !!mutedToggle.checked;
      localStorage.setItem(STORAGE_KEYS.muted, String(state.settings.muted));
      updateHeaderMeta(state);
      updateVideoForQuestion(state, state.currentQuestion, false);
      updateChainVideo(state, (state.chain.usable || [])[state.chain.currentIndex], false);
    });
    if (autoplayToggle) autoplayToggle.addEventListener('change', function () {
      state.settings.autoplayNav = !!autoplayToggle.checked;
      localStorage.setItem(STORAGE_KEYS.autoplayNav, String(state.settings.autoplayNav));
      updateHeaderMeta(state);
    });
    if (autoAdvanceToggle) autoAdvanceToggle.addEventListener('change', function () {
      state.settings.autoAdvance = !!autoAdvanceToggle.checked;
      localStorage.setItem(STORAGE_KEYS.autoAdvance, String(state.settings.autoAdvance));
      clearPendingAdvance(state);
      updateHeaderMeta(state);
    });
    if (delayInput) delayInput.addEventListener('change', function () {
      state.settings.advanceDelaySec = Math.min(5, Math.max(0.5, Number(delayInput.value) || DEFAULT_SETTINGS.advanceDelaySec));
      delayInput.value = String(state.settings.advanceDelaySec);
      localStorage.setItem(STORAGE_KEYS.advanceDelaySec, String(state.settings.advanceDelaySec));
      updateHeaderMeta(state);
    });
    if (chainRefreshBtn) chainRefreshBtn.addEventListener('click', function () { buildChainQuiz(state, { random: true }); });
    if (chainPrevBtn) chainPrevBtn.addEventListener('click', function () { moveChainWindow(state, -1, false); });
    if (chainNextBtn) chainNextBtn.addEventListener('click', function () { moveChainWindow(state, 1, false); });
    if (chainRandomBtn) chainRandomBtn.addEventListener('click', function () { moveChainWindow(state, 0, true); });
    if (chainPlayBtn) chainPlayBtn.addEventListener('click', function () { updateChainVideo(state, (state.chain.usable || [])[state.chain.currentIndex], true); });
  }

  function init() {
    const ref = window.ROAD_TEST_REFERENCE;
    if (!ref || !Array.isArray(ref.segments) || !ref.segments.length) return;
    const state = createState(ref);
    window.ROAD_TEST_QUESTION_BANK = state.questionBank.slice();

    const urlInput = qs('roadTestYoutubeUrlInput');
    const savedUrl = localStorage.getItem(STORAGE_KEYS.youtubeUrl) || DEFAULT_URL;
    state.currentUrl = savedUrl;
    state.currentVideoId = extractYouTubeVideoId(savedUrl);
    if (urlInput) urlInput.value = savedUrl;

    applyPanelOpenStates();
    syncSettingControls(state);
    populateModuleSelect(state);
    bindEvents(state);

    const moduleSelect = qs('roadTestModuleSelect');
    applyFilter(state, moduleSelect ? moduleSelect.value : 'all');
    updateHeaderMeta(state);
  }

  document.addEventListener('DOMContentLoaded', init);
  window.RoadTestSim = { init: init };
}());
