window.addEventListener("DOMContentLoaded", async () => {
  const el = (id) => document.getElementById(id);
  const details = el("firebaseSyncDetails");
  const summaryText = el("firebaseSummaryText");
  const helpText = el("firebase-help-text");
  const displayNameEl = el("firebase-display-name");
  const ownerNoteEl = el("firebase-owner-note");
  const cloudMetaEl = el("firebase-cloud-meta");
  const reminderEl = el("firebase-sync-reminder");
  const privateInfoEl = el("firebase-private-info");
  const togglePrivateBtn = el("btn-firebase-toggle-private");
  const btnLogin = el("btn-google-login");
  const btnLogout = el("btn-google-logout");
  const btnSmokeWrite = el("btn-smoke-write");
  const btnSmokeRead = el("btn-smoke-read");
  const btnCloudUpload = el("btn-cloud-upload");
  const btnCloudDownload = el("btn-cloud-download");
  const btnLocalRestore = el("btn-local-restore");
  const btnRequestAccess = el("btn-request-sync-access");
  const accessStatusEl = el("firebase-access-status");
  const output = el("sync-test-output");
  const autoCloudUploadToggle = el("autoCloudUploadToggle");
  const autoCloudUploadStatus = el("autoCloudUploadStatus");

  const AUTO_UPLOAD_PREF_KEY = "med_exam_auto_cloud_upload_v1";
  const AUTO_UPLOAD_THRESHOLD = 150;
  const AUTO_UPLOAD_COOLDOWN_MS = 10 * 60 * 1000;
  const AUTO_UPLOAD_MIN_STABLE_MS = 4000;

  let modules = null;
  let currentUser = null;
  let cloudMeta = null;
  let accessState = { allowlisted: false, requestStatus: "none" };
  let privateVisible = false;
  let modulesReady = false;
  let loginInFlight = false;
  let autoUploadInFlight = false;
  let autoUploadTimer = null;
  let lastAutoUploadAttemptAt = 0;

  const setOutput = (msg) => {
    if (output) output.textContent = msg || "";
    if (details && msg) details.open = true;
  };
  const setButtonBusy = (btn, busyText, busy) => {
    if (!btn) return;
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent || "";
    btn.disabled = !!busy;
    btn.textContent = busy ? busyText : (btn.dataset.originalText || btn.textContent || "");
  };
  const masked = (value, keep = 2) => {
    const s = String(value || "").trim();
    if (!s) return "";
    if (s.length <= keep) return "*".repeat(s.length);
    return s.slice(0, keep) + "*".repeat(Math.max(2, s.length - keep));
  };
  const setSyncButtonsEnabled = (enabled) => {
    [btnSmokeWrite, btnSmokeRead, btnCloudUpload, btnCloudDownload].forEach((btn) => {
      if (btn) btn.disabled = !enabled;
    });
  };
  const hasCloudAccess = () => !!(currentUser && accessState && accessState.allowlisted);
  const getMemoryApi = () => {
    try {
      if (window.DriverQuizMemory?.buildPayload) return window.DriverQuizMemory;
      if (window.DriverQuizMemoryBridge?.ensureMemoryApi) return window.DriverQuizMemoryBridge.ensureMemoryApi();
    } catch (err) {
      console.error("getMemoryApi failed", err);
    }
    return window.DriverQuizMemory || null;
  };
  const localAnsweredCount = () => {
    try {
      const fast = getMemoryApi()?.getAnsweredCount?.();
      if (Number.isFinite(Number(fast))) return Math.max(0, Number(fast));
      return modules?.backup?.getAnsweredCountFromPayload(getMemoryApi()?.buildPayload?.()) || 0;
    } catch {
      return 0;
    }
  };
  const readAutoUploadEnabled = () => {
    try {
      return localStorage.getItem(AUTO_UPLOAD_PREF_KEY) === "1";
    } catch {
      return false;
    }
  };
  const writeAutoUploadEnabled = (enabled) => {
    try {
      localStorage.setItem(AUTO_UPLOAD_PREF_KEY, enabled ? "1" : "0");
    } catch {}
  };
  const cloudAnsweredCount = () => Math.max(0, Number(cloudMeta?.answeredCount || 0));
  const unansweredDeltaFromCloud = () => Math.max(0, localAnsweredCount() - cloudAnsweredCount());
  const updateAutoUploadStatus = (extraText = "") => {
    if (!autoCloudUploadStatus) return;
    if (!currentUser) {
      autoCloudUploadStatus.textContent = "登入後可啟用自動上傳。";
      return;
    }
    if (!hasCloudAccess()) {
      autoCloudUploadStatus.textContent = "雲端同步尚未啟用或尚未核准，暫不啟用自動上傳。";
      return;
    }
    const enabled = readAutoUploadEnabled();
    const delta = unansweredDeltaFromCloud();
    const localMeta = modules?.backup?.readLocalUploadMeta?.() || {};
    const lastAt = String(localMeta?.uploadedAt || "");
    const base = enabled
      ? `已啟用：差異達 ${AUTO_UPLOAD_THRESHOLD} 題才會自動上傳。`
      : "未啟用自動上傳。";
    const deltaText = delta > 0 ? ` 目前差異約 ${delta} 題。` : " 目前差異不明顯。";
    const lastText = lastAt ? ` 上次上傳：${lastAt}` : "";
    autoCloudUploadStatus.textContent = [base, deltaText, lastText, extraText].filter(Boolean).join("");
  };
  const setRestoreEnabled = () => {
    const snapshotInfo = modules?.backup?.getPreSyncSnapshotInfo?.();
    if (btnLocalRestore) btnLocalRestore.disabled = !snapshotInfo;
  };


if (btnLogin) {
  btnLogin.dataset.originalText = btnLogin.textContent || "Google 登入";
  btnLogin.addEventListener("click", (event) => {
    if (modulesReady || loginInFlight) return;
    event.preventDefault();
    setOutput("同步模組仍在載入中，請稍候 1～2 秒後再試。若長時間沒有變化，代表網頁腳本可能尚未成功載入。");
  });
}


  function renderAccessStatus() {
    if (!accessStatusEl) return;
    if (!currentUser) {
      accessStatusEl.textContent = "";
      if (btnRequestAccess) btnRequestAccess.style.display = "none";
      return;
    }
    if (!accessState?.syncEnabled) {
      const reason = accessState?.configExists === false
        ? "尚未建立 app_config/global 設定文件。"
        : "app_config/global.syncEnabled 不是 true。";
      accessStatusEl.textContent = "雲端同步目前未啟用：" + reason;
      if (btnRequestAccess) {
        btnRequestAccess.style.display = "";
        btnRequestAccess.disabled = true;
        btnRequestAccess.textContent = "同步未啟用";
      }
      return;
    }
    if (accessState?.allowlisted) {
      accessStatusEl.textContent = "雲端同步權限：已核准。";
      if (btnRequestAccess) btnRequestAccess.style.display = "none";
      return;
    }
    const status = accessState?.requestStatus || "none";
    if (status === "pending") {
      accessStatusEl.textContent = "雲端同步權限：已送出申請，等待管理者核准。核准後請重新整理或重新登入。";
      if (btnRequestAccess) {
        btnRequestAccess.style.display = "";
        btnRequestAccess.disabled = true;
        btnRequestAccess.textContent = "已送出申請";
      }
    } else if (status === "rejected") {
      accessStatusEl.textContent = "雲端同步權限：申請曾被拒絕；可重新送出申請。";
      if (btnRequestAccess) {
        btnRequestAccess.style.display = "";
        btnRequestAccess.disabled = false;
        btnRequestAccess.textContent = "重新申請開通雲端同步";
      }
    } else {
      accessStatusEl.textContent = "雲端同步權限：尚未開通。可送出申請，待管理者核准後即可上傳／下載備份。";
      if (btnRequestAccess) {
        btnRequestAccess.style.display = "";
        btnRequestAccess.disabled = false;
        btnRequestAccess.textContent = "申請開通雲端同步";
      }
    }
  }

  async function refreshAccessStatus() {
    if (!currentUser || !modules?.access?.getSyncAccessStatus) {
      accessState = { allowlisted: false, requestStatus: "none" };
      renderAccessStatus();
      return accessState;
    }
    try {
      accessState = await modules.access.getSyncAccessStatus();
    } catch (err) {
      console.error("refreshAccessStatus failed", err);
      accessState = { allowlisted: false, requestStatus: "unknown", error: err?.message || String(err) };
      if (accessStatusEl) accessStatusEl.textContent = "雲端同步權限狀態讀取失敗：" + accessState.error;
    }
    renderAccessStatus();
    return accessState;
  }

  function updateCloudMetaView() {
    if (!cloudMetaEl) return;
    if (!currentUser) {
      cloudMetaEl.textContent = "";
      return;
    }
    if (!cloudMeta?.exists) {
      cloudMetaEl.textContent = "雲端目前沒有備份。";
      return;
    }
    const answered = Number(cloudMeta.answeredCount || 0);
    const when = cloudMeta.updatedAt ? `，更新：${cloudMeta.updatedAt}` : "";
    cloudMetaEl.textContent = `雲端備份：約 ${answered} 題${when}`;
  }

  function updateReminder() {
    if (!reminderEl) return;
    if (!currentUser) {
      reminderEl.textContent = "未登入時可先用本機與 JSON 備份。";
      updateAutoUploadStatus();
      return;
    }
    const delta = unansweredDeltaFromCloud();
    if (delta >= AUTO_UPLOAD_THRESHOLD) {
      reminderEl.textContent = `目前約多 ${delta} 題，建議手動上傳備份。`;
    } else if (delta > 0) {
      reminderEl.textContent = `目前約多 ${delta} 題，尚未達自動上傳門檻。`;
    } else {
      reminderEl.textContent = "目前與雲端差異不明顯。";
    }
    updateAutoUploadStatus();
  }

  async function refreshCloudMeta() {
    if (!currentUser || !modules?.backup?.getCloudBackupMetaSummary || !hasCloudAccess()) {
      cloudMeta = null;
      updateCloudMetaView();
      return;
    }
    try {
      cloudMeta = await modules.backup.getCloudBackupMetaSummary();
    } catch (err) {
      console.error("refreshCloudMeta failed", err);
      cloudMeta = { exists: false, error: err?.message || String(err) };
    }
    updateCloudMetaView();
  }

  async function maybeAutoUpload(reason = "") {
    if (!currentUser || !hasCloudAccess() || !modules?.backup?.uploadFullMemoryBackup) return;
    if (!readAutoUploadEnabled()) return;
    if (autoUploadInFlight) return;
    if (!getMemoryApi()?.buildPayload) return;
    if (getMemoryApi()?.isSessionInProgress?.()) return;
    if (document.visibilityState && document.visibilityState !== "visible") return;

    const now = Date.now();
    if (now - lastAutoUploadAttemptAt < AUTO_UPLOAD_COOLDOWN_MS) return;

    const delta = unansweredDeltaFromCloud();
    if (delta < AUTO_UPLOAD_THRESHOLD) {
      updateAutoUploadStatus();
      return;
    }

    const localMeta = modules?.backup?.readLocalUploadMeta?.() || {};
    const lastUploadedAnswered = Number(localMeta?.answeredCount || 0);
    const localAnswered = localAnsweredCount();
    if ((localAnswered - lastUploadedAnswered) < AUTO_UPLOAD_THRESHOLD) {
      updateAutoUploadStatus(" 已接近最近一次上傳，暫不重傳。");
      return;
    }

    lastAutoUploadAttemptAt = now;
    autoUploadInFlight = true;
    updateAutoUploadStatus(" 自動上傳中...");
    try {
      const result = await modules.backup.uploadFullMemoryBackup(() => getMemoryApi().buildPayload());
      await refreshCloudMeta();
      updateReminder();
      updateAutoUploadStatus(result?.skipped ? " 已檢查，雲端內容相同。" : " 已於本次完成後自動上傳。");
    } catch (err) {
      console.error("auto upload failed", err);
      updateAutoUploadStatus(` 自動上傳暫停：${err?.message || String(err)}`);
    } finally {
      autoUploadInFlight = false;
    }
  }

  function scheduleAutoUploadCheck(reason = "") {
    if (autoUploadTimer) window.clearTimeout(autoUploadTimer);
    autoUploadTimer = window.setTimeout(() => {
      maybeAutoUpload(reason).catch((err) => console.error("scheduled auto upload failed", err));
    }, AUTO_UPLOAD_MIN_STABLE_MS);
  }

  function renderUser() {
    if (details) details.open = false;

    if (currentUser) {
      const name = currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "已登入使用者");
      if (summaryText) summaryText.textContent = `雲端同步：${name}`;
      if (displayNameEl) displayNameEl.textContent = `名稱：${name}`;
      if (privateInfoEl) {
        privateInfoEl.style.display = privateVisible ? "block" : "none";
        privateInfoEl.textContent = privateVisible
          ? `Email：${currentUser.email || "未提供"}\nUID：${currentUser.uid || "未提供"}`
          : `Email：${masked(currentUser.email, 2)}\nUID：${masked(currentUser.uid, 4)}`;
      }
      if (togglePrivateBtn) {
        togglePrivateBtn.style.display = "";
        togglePrivateBtn.textContent = privateVisible ? "🙈" : "👁";
        togglePrivateBtn.title = privateVisible ? "隱藏個資" : "顯示個資";
      }
      if (btnLogin) btnLogin.style.display = "none";
      if (btnLogout) btnLogout.style.display = "";
      setSyncButtonsEnabled(hasCloudAccess());
      setRestoreEnabled();
      if (ownerNoteEl) {
        ownerNoteEl.style.display = "";
        ownerNoteEl.textContent = hasCloudAccess()
          ? "你已獲准使用雲端同步。仍建議定期匯出 JSON 作為離線備份。"
          : "你已登入，但尚未開通雲端同步。可按『申請開通雲端同步』，待管理者核准後即可使用上傳／下載雲端記憶到本機。未開通者仍可使用本機功能與 JSON 匯入匯出。";
      }
      if (helpText) helpText.textContent = "最簡說明：建議使用 Chrome。登入後會先檢查同步權限；核准後才可上傳或下載雲端記憶到本機。下載套用成功後系統會自動刷新一次；若數據仍未更新，請再手動刷新。";
      renderAccessStatus();
      updateCloudMetaView();
      updateReminder();
      if (!output?.textContent) {
        setOutput(hasCloudAccess()
          ? "已登入且同步權限已核准。雲端不會自動載入；若需要再手動下載。\n載入前會先保存同步前本機備份，可隨時還原。"
          : "已登入，但尚未開通雲端同步。請按『申請開通雲端同步』，等待管理者核准。\n未核准前仍可正常練題與使用 JSON 匯入匯出。");
      }
      return;
    }

    if (summaryText) summaryText.textContent = "雲端同步：未登入（展開登入選項）";
    if (displayNameEl) displayNameEl.textContent = "尚未登入";
    if (privateInfoEl) {
      privateInfoEl.style.display = "none";
      privateInfoEl.textContent = "";
    }
    if (togglePrivateBtn) togglePrivateBtn.style.display = "none";
    if (btnLogin) btnLogin.style.display = "";
    if (btnLogout) btnLogout.style.display = "none";
    if (btnLocalRestore) btnLocalRestore.disabled = !modules?.backup?.getPreSyncSnapshotInfo?.();
    setSyncButtonsEnabled(false);
    if (ownerNoteEl) ownerNoteEl.style.display = "none";
    if (cloudMetaEl) cloudMetaEl.textContent = "";
    if (helpText) helpText.textContent = "最簡說明：未登入時仍可正常練題與使用 JSON 匯入匯出；登入只影響雲端同步。";
    accessState = { allowlisted: false, requestStatus: "none" };
    renderAccessStatus();
    updateReminder();
    if (!output?.textContent) {
      setOutput("請先登入 Google。登入後可直接按『申請開通雲端同步』，不需要手動傳 UID 給管理者。\n若手機無法彈出登入視窗，請允許彈出視窗或改用桌面瀏覽器。");
    }
  }

  setSyncButtonsEnabled(false);
  if (btnCloudUpload) btnCloudUpload.disabled = true;
  if (btnCloudDownload) btnCloudDownload.disabled = true;
  if (btnSmokeWrite) btnSmokeWrite.disabled = true;
  if (btnSmokeRead) btnSmokeRead.disabled = true;
  if (btnLocalRestore) btnLocalRestore.disabled = true;
  if (btnLogin) btnLogin.textContent = "載入登入模組...";
  try {
    modules = {
      auth: await import("./firebase-auth.js?v=20260424med018"),
      smoke: await import("./firebase-sync-smoke.js?v=20260424med018"),
      backup: await import("./firebase-backup.js?v=20260424med018"),
      access: await import("./firebase-access.js?v=20260424med018"),
    };
  } catch (err) {
    console.error("firebase modules import failed", err);
    setOutput("Firebase 模組載入失敗：" + (err?.message || String(err)));
    return;
  }

  const { loginWithGoogle, logoutFirebase, watchAuthState, finishRedirectLogin } = modules.auth;
  modulesReady = true;
  if (btnLogin) {
    btnLogin.disabled = false;
    btnLogin.textContent = btnLogin.dataset.originalText || "Google 登入";
  }
  const { smokeWrite, smokeRead } = modules.smoke;
  const { uploadFullMemoryBackup, downloadFullMemoryBackup, restorePreSyncSnapshot, savePreSyncSnapshot } = modules.backup;

  if (autoCloudUploadToggle) {
    autoCloudUploadToggle.checked = readAutoUploadEnabled();
    autoCloudUploadToggle.addEventListener("change", () => {
      writeAutoUploadEnabled(!!autoCloudUploadToggle.checked);
      updateReminder();
      if (autoCloudUploadToggle.checked) scheduleAutoUploadCheck("使用者剛啟用自動上傳");
    });
  }

  if (details) details.open = false;
  if (togglePrivateBtn) {
    togglePrivateBtn.addEventListener("click", () => {
      privateVisible = !privateVisible;
      renderUser();
    });
  }

  try {
    await finishRedirectLogin();
  } catch (err) {
    console.error("finishRedirectLogin failed", err);
    setOutput("Firebase 登入初始化失敗：" + (err?.message || String(err)));
  }

  
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      if (!modulesReady) {
        setOutput("同步模組仍在載入中，請稍候再試。");
        return;
      }
      if (loginInFlight) return;
      loginInFlight = true;
      try {
        setButtonBusy(btnLogin, "登入中...", true);
        setOutput("登入中... 若 8 秒內仍沒有出現 Google 視窗，通常是瀏覽器擋下彈窗、網路太慢，或網頁腳本尚未完整載入。");
        const warnTimer = setTimeout(() => {
          setOutput("登入流程仍在等待中。若完全沒有跳出 Google 視窗，較可能是瀏覽器彈窗限制或網頁腳本異常；若有跳出視窗但又回到未登入，才比較像 Google/Firebase 流程問題。");
        }, 8000);
        await loginWithGoogle();
        clearTimeout(warnTimer);
      } catch (err) {
        console.error(err);
        setOutput(`Google 登入失敗：
${err?.message || String(err)}`);
      } finally {
        loginInFlight = false;
        setButtonBusy(btnLogin, "登入中...", false);
      }
    });
  }


  if (btnRequestAccess) {
    btnRequestAccess.addEventListener("click", async () => {
      try {
        setButtonBusy(btnRequestAccess, "送出中...", true);
        setOutput("正在送出同步權限申請...");
        accessState = await modules.access.requestSyncAccess("申請醫學題庫雲端同步權限");
        renderAccessStatus();
        setSyncButtonsEnabled(hasCloudAccess());
        setOutput("已送出同步權限申請。請等待管理者在 admin.html 核准；核准後重新整理頁面即可使用同步。");
      } catch (err) {
        console.error(err);
        setOutput("申請開通雲端同步失敗：\n" + (err?.message || String(err)));
      } finally {
        if (accessState?.requestStatus !== "pending") {
          setButtonBusy(btnRequestAccess, "送出中...", false);
        }
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await logoutFirebase();
        cloudMeta = null;
        setOutput("已登出");
      } catch (err) {
        console.error(err);
        setOutput("登出失敗：" + (err?.message || String(err)));
      }
    });
  }

  if (btnSmokeWrite) {
    btnSmokeWrite.addEventListener("click", async () => {
      try {
        if (!hasCloudAccess()) throw new Error("雲端同步權限尚未核准，請先送出申請並等待管理者核准。");
        setOutput("寫入中...");
        await smokeWrite();
        await refreshCloudMeta();
        setOutput("寫入成功");
      } catch (err) {
        console.error(err);
        setOutput("寫入失敗：\n" + (err?.message || String(err)));
      }
    });
  }

  if (btnSmokeRead) {
    btnSmokeRead.addEventListener("click", async () => {
      try {
        if (!hasCloudAccess()) throw new Error("雲端同步權限尚未核准，請先送出申請並等待管理者核准。");
        setOutput("讀取中...");
        const data = await smokeRead();
        setOutput(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(err);
        setOutput("讀取失敗：\n" + (err?.message || String(err)));
      }
    });
  }

  if (btnCloudUpload) {
    btnCloudUpload.addEventListener("click", async () => {
      try {
        if (!hasCloudAccess()) throw new Error("雲端同步權限尚未核准，請先送出申請並等待管理者核准。");
        const memoryApi = getMemoryApi();
        if (!memoryApi?.buildPayload) throw new Error("找不到完整資料匯出函式（DriverQuizMemory.buildPayload）。");
        setOutput("上傳完整資料中...");
        const result = await uploadFullMemoryBackup(() => getMemoryApi().buildPayload());
        await refreshCloudMeta();
        setOutput(result.message || "上傳完成");
        updateReminder();
    } catch (err) {
      console.error(err);
      setOutput(`雲端上傳失敗：
${err?.message || String(err)}`);
    } finally {
      setButtonBusy(btnCloudUpload, "上傳中...", false);
    }
  });
}

  if (btnCloudDownload) {
    btnCloudDownload.addEventListener("click", async () => {
      try {
        if (!hasCloudAccess()) throw new Error("雲端同步權限尚未核准，請先送出申請並等待管理者核准。");
        const memoryApi = getMemoryApi();
        if (!memoryApi?.applyPayload || !memoryApi?.buildPayload) {
          throw new Error("找不到完整資料匯入／匯出函式。");
        }
        await refreshCloudMeta();
        if (!cloudMeta?.exists) throw new Error("雲端目前沒有備份可下載。");
        const msg = [
          "是否現在載入雲端備份？",
          cloudMeta.updatedAt ? `雲端更新時間：${cloudMeta.updatedAt}` : "",
          `雲端累計作答：約 ${Number(cloudMeta.answeredCount || 0)} 題`,
          `本機累計作答：約 ${localAnsweredCount()} 題`,
          "",
          "按『確定』後，下一步可選擇覆蓋或合併；按『取消』則不載入。"
        ].filter(Boolean).join("\n");
        if (!window.confirm(msg)) {
          setOutput("已取消載入雲端備份。本機資料保持不變。");
          return;
        }
        savePreSyncSnapshot(() => getMemoryApi().buildPayload());
        setRestoreEnabled();
        const result = await downloadFullMemoryBackup();
        const replaceAll = window.confirm(`第二步：按『確定』= 覆蓋本機；按『取消』= 與本機合併。
覆蓋前已自動保存同步前本機備份。
`);
        const applyResult = getMemoryApi().applyPayload(result.payload, replaceAll);
        setOutput(`${result.message || "下載完成"}

${applyResult?.message || "已套用到本機。"}

系統將自動刷新一次，以確保畫面統計與錯題本同步更新。若刷新後仍未更新，請再手動重新整理頁面。`);
        updateReminder();
        window.setTimeout(() => {
          try { window.location.reload(); } catch (reloadErr) { console.warn("auto reload after cloud download failed", reloadErr); }
        }, 1200);
    } catch (err) {
      console.error(err);
      setOutput(`雲端下載失敗：
${err?.message || String(err)}`);
    } finally {
      setButtonBusy(btnCloudDownload, "下載中...", false);
    }
  });
}

  if (btnLocalRestore) {
    btnLocalRestore.addEventListener("click", async () => {
      try {
        const memoryApi = getMemoryApi();
        if (!memoryApi?.applyPayload) throw new Error("找不到完整資料匯入函式。")
        const result = restorePreSyncSnapshot((payload, replaceAll) => getMemoryApi().applyPayload(payload, replaceAll ? "replace" : "conservative"));
        setOutput(result?.message || "已還原下載前本機備份。");
        updateReminder();
      } catch (err) {
        console.error(err);
        setOutput("還原失敗：\n" + (err?.message || String(err)));
      }
    });
  }

  window.addEventListener("driverquiz:progress-saved", (event) => {
    const totalAnswered = Number(event?.detail?.totalAnswered || 0);
    updateReminder();
    updateAutoUploadStatus(totalAnswered > 0 ? ` 本地累計作答：約 ${totalAnswered} 題。` : "");
  });

  window.addEventListener("driverquiz:session-completed", (event) => {
    const count = Number(event?.detail?.sessionQuestionCount || 0);
    updateReminder();
    scheduleAutoUploadCheck(count > 0 ? `本次題組完成（${count} 題）` : "本次題組完成");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshAccessStatus().then(() => refreshCloudMeta()).then(() => {
        updateReminder();
        if (!getMemoryApi()?.isSessionInProgress?.()) {
          scheduleAutoUploadCheck("頁面恢復可見");
        }
      }).catch((err) => console.error("visibility refresh failed", err));
    }
  });

  watchAuthState(async (user) => {
    currentUser = user || null;
    privateVisible = false;
    if (currentUser) {
      await refreshAccessStatus();
      await refreshCloudMeta();
    } else {
      accessState = { allowlisted: false, requestStatus: "none" };
      cloudMeta = null;
      updateCloudMetaView();
    }
    renderUser();
    setRestoreEnabled();
    updateReminder();
    if (currentUser) scheduleAutoUploadCheck("登入後檢查");
  });

  renderUser();
  updateReminder();
});
