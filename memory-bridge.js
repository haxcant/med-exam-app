(function () {
  const APP_ID = "med-exam-pwa";
  const STORAGE_KEY = "med-exam-progress-v1";
  const SESSION_KEY = "med-exam-session-v1";
  const SETTINGS_KEY = "med-exam-settings-v1";
  const IMAGE_ISSUES_KEY = "med-exam-image-issues-v1";
  const MEMORY_EXPORT_VERSION = 1;

  function safeParse(raw, fallback) {
    if (typeof raw !== "string" || !raw.trim()) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function readStorageJson(key, fallback) {
    try {
      return safeParse(localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function readProgress() {
    const data = readStorageJson(STORAGE_KEY, {});
    return data && typeof data === "object" ? data : {};
  }

  function readSession() {
    const data = readStorageJson(SESSION_KEY, null);
    return data && typeof data === "object" ? data : null;
  }

  function readSettings() {
    const data = readStorageJson(SETTINGS_KEY, {});
    return data && typeof data === "object" ? data : {};
  }

  function readImageIssues() {
    const data = readStorageJson(IMAGE_ISSUES_KEY, {});
    return data && typeof data === "object" ? data : {};
  }

  function getAnsweredCount() {
    const progress = readProgress();
    const meta = progress && typeof progress.meta === "object" ? progress.meta : {};
    const total = Number(meta.totalAnswered || 0);
    if (Number.isFinite(total) && total >= 0) return total;
    return 0;
  }

  function isSessionInProgress() {
    const session = readSession();
    if (!session || typeof session !== "object") return false;
    const queueLen = Array.isArray(session.queue) ? session.queue.length : 0;
    const index = Math.max(0, Number(session.index || 0));
    const hasQuizClass = !!document.body?.classList?.contains("quiz-mode-active");
    return queueLen > 0 && index < queueLen && hasQuizClass;
  }

  function buildPayload() {
    return {
      app: APP_ID,
      type: "full-memory-export",
      version: MEMORY_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      storageKeys: {
        progress: STORAGE_KEY,
        session: SESSION_KEY,
        settings: SETTINGS_KEY,
        imageIssues: IMAGE_ISSUES_KEY,
      },
      progress: readProgress(),
      session: readSession(),
      settings: readSettings(),
      imageIssues: readImageIssues(),
      source: "memory-bridge",
    };
  }



  function pickPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function defaultQuestionProgress() {
    return {
      totalSeen: 0,
      totalCorrect: 0,
      totalWrong: 0,
      score: 0,
      inWrongBook: false,
      masteryStreak: 0,
      lastWrongAt: "",
      lastSeenAt: "",
    };
  }

  function repairQuestionProgressRecord(raw) {
    const src = pickPlainObject(raw);
    const item = { ...defaultQuestionProgress(), ...src };
    const totalSeen = Math.max(0, Math.round(Number(item.totalSeen || 0)));
    const totalCorrect = Math.max(0, Math.round(Number(item.totalCorrect || 0)));
    const totalWrong = Math.max(0, Math.round(Number(item.totalWrong || 0)));
    const rawScore = Number(item.score);
    const computedScore = totalCorrect - totalWrong;
    const score = Number.isFinite(rawScore) ? Math.max(-999, Math.min(999, Math.round(rawScore))) : computedScore;
    return {
      totalSeen,
      totalCorrect,
      totalWrong,
      score,
      inWrongBook: !!item.inWrongBook || score < 0 || totalWrong > totalCorrect,
      masteryStreak: Math.max(0, Math.round(Number(item.masteryStreak || 0))),
      lastWrongAt: typeof item.lastWrongAt === "string" ? item.lastWrongAt : "",
      lastSeenAt: typeof item.lastSeenAt === "string" ? item.lastSeenAt : "",
    };
  }

  function computeProgressMeta(byQuestion, fallbackMeta) {
    const mergedCloudChecksums = Array.isArray(fallbackMeta?.mergedCloudChecksums)
      ? Array.from(new Set(fallbackMeta.mergedCloudChecksums.map((x) => String(x || "").trim()).filter(Boolean))).slice(-20)
      : [];
    const meta = {
      totalAnswered: 0,
      totalCorrect: 0,
      bestStreak: Math.max(0, Math.round(Number(fallbackMeta?.bestStreak || 0))),
      totalCompletedSessions: Math.max(0, Math.round(Number(fallbackMeta?.totalCompletedSessions || 0))),
      mergedCloudChecksums,
    };
    for (const item of Object.values(byQuestion || {})) {
      meta.totalAnswered += Math.max(0, Number(item?.totalSeen || 0));
      meta.totalCorrect += Math.max(0, Number(item?.totalCorrect || 0));
    }
    return meta;
  }

  function normalizeProgress(raw) {
    const root = pickPlainObject(raw);
    const byQuestionSrc = pickPlainObject(root.byQuestion);
    const byQuestion = {};
    for (const [id, value] of Object.entries(byQuestionSrc)) {
      byQuestion[id] = repairQuestionProgressRecord(value);
    }
    return {
      byQuestion,
      meta: computeProgressMeta(byQuestion, root.meta),
    };
  }

  function extractEnvelope(rawPayload) {
    const root = pickPlainObject(rawPayload);
    const nestedMemory = pickPlainObject(root.memory);
    const nestedData = pickPlainObject(root.data);
    const candidate = (nestedMemory.progress || nestedMemory.settings || nestedMemory.session || nestedMemory.imageIssues)
      ? nestedMemory
      : ((nestedData.progress || nestedData.settings || nestedData.session || nestedData.imageIssues) ? nestedData : root);
    return {
      progress: normalizeProgress(candidate.progress || (candidate.byQuestion || candidate.meta ? candidate : {})),
      settings: pickPlainObject(candidate.settings),
      session: candidate.session && typeof candidate.session === "object" ? candidate.session : null,
      imageIssues: pickPlainObject(candidate.imageIssues),
    };
  }

  function maxIsoString(a, b) {
    const aa = typeof a === "string" ? a : "";
    const bb = typeof b === "string" ? b : "";
    if (!aa) return bb;
    if (!bb) return aa;
    return aa >= bb ? aa : bb;
  }

  function chooseConservativeRecord(localRecord, incomingRecord) {
    const a = repairQuestionProgressRecord(localRecord);
    const b = repairQuestionProgressRecord(incomingRecord);
    const preferred = (() => {
      if (b.inWrongBook && !a.inWrongBook) return b;
      if (a.inWrongBook && !b.inWrongBook) return a;
      if (Number(b.score || 0) < Number(a.score || 0)) return b;
      if (Number(a.score || 0) < Number(b.score || 0)) return a;
      if (Number(b.totalWrong || 0) > Number(a.totalWrong || 0)) return b;
      if (Number(a.totalWrong || 0) > Number(b.totalWrong || 0)) return a;
      if (Number(b.totalSeen || 0) > Number(a.totalSeen || 0)) return b;
      return a;
    })();
    const totalSeen = Math.max(Number(a.totalSeen || 0), Number(b.totalSeen || 0), Number(preferred.totalSeen || 0));
    const totalCorrect = Math.max(Number(a.totalCorrect || 0), Number(b.totalCorrect || 0), Number(preferred.totalCorrect || 0));
    const totalWrong = Math.max(Number(a.totalWrong || 0), Number(b.totalWrong || 0), Number(preferred.totalWrong || 0));
    const score = Math.min(Number(a.score || 0), Number(b.score || 0), Number(preferred.score || 0));
    return repairQuestionProgressRecord({
      ...preferred,
      totalSeen,
      totalCorrect,
      totalWrong,
      score,
      inWrongBook: !!a.inWrongBook || !!b.inWrongBook || score < 0 || totalWrong > totalCorrect,
      masteryStreak: Math.min(Number(a.masteryStreak || 0), Number(b.masteryStreak || 0), Number(preferred.masteryStreak || 0)),
      lastSeenAt: maxIsoString(a.lastSeenAt, b.lastSeenAt),
      lastWrongAt: maxIsoString(a.lastWrongAt, b.lastWrongAt),
    });
  }

  function mergeProgressConservative(localProgress, incomingProgress) {
    const localNorm = normalizeProgress(localProgress);
    const incomingNorm = normalizeProgress(incomingProgress);
    const merged = { byQuestion: { ...localNorm.byQuestion }, meta: {} };
    for (const [id, incoming] of Object.entries(incomingNorm.byQuestion)) {
      if (!merged.byQuestion[id]) merged.byQuestion[id] = repairQuestionProgressRecord(incoming);
      else merged.byQuestion[id] = chooseConservativeRecord(merged.byQuestion[id], incoming);
    }
    merged.meta = computeProgressMeta(merged.byQuestion, {
      bestStreak: Math.max(Number(localNorm.meta?.bestStreak || 0), Number(incomingNorm.meta?.bestStreak || 0)),
      totalCompletedSessions: Math.max(Number(localNorm.meta?.totalCompletedSessions || 0), Number(incomingNorm.meta?.totalCompletedSessions || 0)),
      mergedCloudChecksums: [
        ...(Array.isArray(localNorm.meta?.mergedCloudChecksums) ? localNorm.meta.mergedCloudChecksums : []),
        ...(Array.isArray(incomingNorm.meta?.mergedCloudChecksums) ? incomingNorm.meta.mergedCloudChecksums : []),
      ],
    });
    return merged;
  }

  function mergeImageIssues(localIssues, incomingIssues) {
    const localObj = pickPlainObject(localIssues);
    const incomingObj = pickPlainObject(incomingIssues);
    const merged = { ...localObj };
    for (const [key, val] of Object.entries(incomingObj)) {
      const current = pickPlainObject(merged[key]);
      const next = pickPlainObject(val);
      merged[key] = {
        flag: !!(current.flag || next.flag),
        note: (typeof current.note === "string" && current.note.trim()) ? current.note : (typeof next.note === "string" ? next.note : ""),
      };
    }
    return merged;
  }

  function applyPayload(rawPayload, importModeOrReplaceAll = true) {
    const envelope = extractEnvelope(rawPayload || {});
    let mode = importModeOrReplaceAll;
    let sourceChecksum = "";
    if (importModeOrReplaceAll && typeof importModeOrReplaceAll === "object") {
      mode = importModeOrReplaceAll.mode || (importModeOrReplaceAll.replaceAll ? "replace" : "conservative");
      sourceChecksum = String(importModeOrReplaceAll.sourceChecksum || importModeOrReplaceAll.checksum || "").trim();
    }
    if (typeof mode === "boolean") mode = mode ? "replace" : "conservative";
    if (!["replace", "coverage", "conservative"].includes(String(mode || ""))) mode = "replace";

    const localProgress = readProgress();
    const localSettings = readSettings();
    const localImageIssues = readImageIssues();

    const finalProgress = String(mode) === "replace"
      ? envelope.progress
      : mergeProgressConservative(localProgress, envelope.progress);
    if (sourceChecksum) {
      const prev = Array.isArray(finalProgress.meta?.mergedCloudChecksums) ? finalProgress.meta.mergedCloudChecksums : [];
      finalProgress.meta.mergedCloudChecksums = Array.from(new Set([...prev, sourceChecksum].map((x) => String(x || "").trim()).filter(Boolean))).slice(-20);
    }
    const finalSettings = String(mode) === "replace"
      ? envelope.settings
      : { ...envelope.settings, ...localSettings };
    const finalImageIssues = String(mode) === "replace"
      ? envelope.imageIssues
      : mergeImageIssues(localImageIssues, envelope.imageIssues);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProgress));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalSettings));
    localStorage.setItem(IMAGE_ISSUES_KEY, JSON.stringify(finalImageIssues));
    try { localStorage.removeItem(SESSION_KEY); } catch {}

    return {
      ok: true,
      message: String(mode) === "replace" ? "已覆蓋套用到本機；建議重新整理頁面。" : "已合併套用到本機；建議重新整理頁面。",
      mode: String(mode),
      reloadSuggested: true,
    };
  }
  function ensureMemoryApi() {
    const current = window.DriverQuizMemory || {};
    const next = {
      ...current,
      buildPayload: typeof current.buildPayload === "function" ? current.buildPayload : buildPayload,
      getAnsweredCount: typeof current.getAnsweredCount === "function" ? current.getAnsweredCount : getAnsweredCount,
      isSessionInProgress: typeof current.isSessionInProgress === "function" ? current.isSessionInProgress : isSessionInProgress,
      applyPayload: typeof current.applyPayload === "function" ? current.applyPayload : applyPayload,
    };
    window.DriverQuizMemory = next;
    return next;
  }

  function exportPayloadAsJson() {
    const payload = ensureMemoryApi().buildPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `med-exam-memory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  function bindFallbackExportButton() {
    const btn = document.getElementById("exportMemoryBtn");
    if (!btn || btn.dataset.memoryBridgeBound === "1") return;
    btn.dataset.memoryBridgeBound = "1";
    btn.addEventListener("click", (event) => {
      const api = ensureMemoryApi();
      if (typeof api.buildPayload !== "function") return;
      // 若 app.js 已正常綁定原本匯出函式，讓它優先處理。
      // 這個 fallback 只在事件結束後仍未觸發下載時補上。
      const before = document.querySelectorAll('a[download^="med-exam-memory-"]').length;
      setTimeout(() => {
        const after = document.querySelectorAll('a[download^="med-exam-memory-"]').length;
        if (after > before) return;
        try {
          exportPayloadAsJson();
        } catch (err) {
          console.error("memory-bridge export fallback failed", err);
        }
      }, 0);
    }, false);
  }

  window.DriverQuizMemoryBridge = {
    ensureMemoryApi,
    buildPayload,
    getAnsweredCount,
    isSessionInProgress,
    applyPayload,
    exportPayloadAsJson,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      ensureMemoryApi();
      bindFallbackExportButton();
    }, { once: true });
  } else {
    ensureMemoryApi();
    bindFallbackExportButton();
  }

  window.addEventListener("pageshow", () => {
    ensureMemoryApi();
    bindFallbackExportButton();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ensureMemoryApi();
  });
})();
