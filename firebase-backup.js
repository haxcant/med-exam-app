import { auth, db } from "./firebase-init.js";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CHUNK_CHARS = 120000;
const MAX_CHUNKS = 10;
const MAX_TOTAL_BYTES = Math.floor(2.4 * 1024 * 1024);
const APP_NAMESPACE = "med-exam-app";
const APP_ID = "med-exam-pwa";
const SNAPSHOT_KEY = "med_exam_pre_sync_snapshot_v1";
const UPLOAD_META_KEY = "med_exam_cloud_upload_meta_v1";
const MIN_UPLOAD_INTERVAL_MS = 60000;

async function getCurrentUser(waitMs = 4000) {
  const started = Date.now();
  while (Date.now() - started < waitMs) {
    const user = auth.currentUser;
    if (user) return user;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error("尚未登入 Google，或登入狀態尚未完成同步。請稍候再試一次。");
}

function explainError(error) {
  const msg = error?.message || String(error || "");
  if (/Missing or insufficient permissions/i.test(msg)) {
    return "你已登入，但尚未開通雲端同步權限，或 app_config/global.syncEnabled 不是 true。請先確認已送出申請並由管理者核准。";
  }
  return msg || "未知錯誤";
}

function splitIntoChunks(text, chunkChars = CHUNK_CHARS) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkChars) chunks.push(text.slice(i, i + chunkChars));
  return chunks.length ? chunks : [""];
}

async function sha256Hex(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function chunkId(index) {
  return `chunk_${String(index).padStart(4, "0")}`;
}

function syncMetaRef(user) {
  return doc(db, "apps", APP_NAMESPACE, "users", user.uid, "sync", "meta");
}

function syncChunkRef(user, index) {
  return doc(db, "apps", APP_NAMESPACE, "users", user.uid, "sync_chunks", chunkId(index));
}

function nowIso() {
  return new Date().toISOString();
}

function pickPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function keepTouchedQuestions(byQuestionRaw) {
  const src = pickPlainObject(byQuestionRaw);
  const out = {};
  for (const [id, raw] of Object.entries(src)) {
    const item = pickPlainObject(raw);
    const totalSeen = Math.max(0, Number(item.totalSeen || 0));
    const totalCorrect = Math.max(0, Number(item.totalCorrect || 0));
    const totalWrong = Math.max(0, Number(item.totalWrong || 0));
    const score = Number.isFinite(Number(item.score)) ? Number(item.score) : (totalCorrect - totalWrong);
    const masteryStreak = Math.max(0, Number(item.masteryStreak || 0));
    const inWrongBook = !!item.inWrongBook;
    const lastWrongAt = typeof item.lastWrongAt === "string" ? item.lastWrongAt : "";
    const lastSeenAt = typeof item.lastSeenAt === "string" ? item.lastSeenAt : "";
    const touched = totalSeen > 0 || totalCorrect > 0 || totalWrong > 0 || score !== 0 || masteryStreak > 0 || inWrongBook || !!lastWrongAt || !!lastSeenAt;
    if (!touched) continue;
    out[id] = { totalSeen, totalCorrect, totalWrong, score, inWrongBook, masteryStreak, lastWrongAt, lastSeenAt };
  }
  return out;
}

function sanitizeSettingsForCloud(rawSettings) {
  const src = pickPlainObject(rawSettings);
  const out = {};
  const allowedKeys = [
    "examScope", "practiceMode", "questionMode", "questionCount", "masteryTarget",
    "scoreFilterOperator", "scoreFilterValue", "answerTimeLimitSec",
    "autoNextCorrectDelaySec", "autoNextWrongDelaySec", "soundVolumePct",
    "shortcutOption1", "shortcutOption2", "shortcutOption3", "shortcutOption4", "shortcutNext"
  ];
  for (const key of allowedKeys) {
    if (src[key] !== undefined) out[key] = src[key];
  }
  return out;
}

function sanitizeImageIssuesForCloud(rawIssues) {
  const src = pickPlainObject(rawIssues);
  const out = {};
  for (const [id, raw] of Object.entries(src)) {
    const item = pickPlainObject(raw);
    const note = typeof item.note === "string" ? item.note.slice(0, 500) : "";
    const flag = !!item.flag;
    if (!flag && !note) continue;
    out[id] = { flag, note };
  }
  return out;
}

function optimizePayloadForCloud(payload) {
  const src = pickPlainObject(payload);
  const progress = pickPlainObject(src.progress);
  const progressMeta = pickPlainObject(progress.meta);
  const byQuestion = keepTouchedQuestions(progress.byQuestion);
  return {
    app: typeof src.app === "string" ? src.app : APP_ID,
    type: typeof src.type === "string" ? src.type : "full-memory-export",
    version: Number(src.version || 1),
    exportedAt: typeof src.exportedAt === "string" ? src.exportedAt : nowIso(),
    progress: {
      byQuestion,
      meta: {
        bestStreak: Math.max(0, Number(progressMeta.bestStreak || 0)),
        totalCompletedSessions: Math.max(0, Number(progressMeta.totalCompletedSessions || 0)),
      },
    },
    settings: sanitizeSettingsForCloud(src.settings),
    imageIssues: sanitizeImageIssuesForCloud(src.imageIssues),
  };
}

export function getAnsweredCountFromPayload(payload) {
  const direct = Number(payload?.progress?.meta?.totalAnswered || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const byQuestion = payload?.progress?.byQuestion;
  if (byQuestion && typeof byQuestion === "object") {
    let total = 0;
    for (const item of Object.values(byQuestion)) {
      total += Number(item?.totalSeen || 0);
    }
    return total;
  }
  return 0;
}

export function readLocalUploadMeta() {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_META_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeLocalUploadMeta(meta) {
  try {
    localStorage.setItem(UPLOAD_META_KEY, JSON.stringify({
      checksum: String(meta?.checksum || ""),
      answeredCount: Number(meta?.answeredCount || 0),
      uploadedAt: String(meta?.uploadedAt || nowIso()),
    }));
  } catch {}
}

export function savePreSyncSnapshot(buildPayloadFn) {
  if (typeof buildPayloadFn !== "function") throw new Error("找不到完整資料匯出函式。");
  const payload = buildPayloadFn();
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: nowIso(), payload }));
  } catch (err) {
    console.warn("savePreSyncSnapshot failed", err);
  }
  return payload;
}

export function getPreSyncSnapshotInfo() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "null");
    if (!parsed?.payload) return null;
    return {
      savedAt: String(parsed.savedAt || ""),
      answeredCount: getAnsweredCountFromPayload(parsed.payload),
    };
  } catch {
    return null;
  }
}

export function restorePreSyncSnapshot(applyPayloadFn) {
  if (typeof applyPayloadFn !== "function") throw new Error("找不到完整資料匯入函式。");
  const raw = localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) throw new Error("目前沒有可還原的同步前本機備份。");
  const parsed = JSON.parse(raw);
  if (!parsed?.payload) throw new Error("同步前本機備份內容無效。");
  return applyPayloadFn(parsed.payload, true);
}

export async function getCloudBackupMetaSummary() {
  try {
    const user = await getCurrentUser();
    const metaRef = syncMetaRef(user);
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) return { exists: false };
    const meta = metaSnap.data() || {};
    return {
      exists: true,
      checksum: String(meta.checksum || ""),
      chunkCount: Number(meta.chunkCount || 0),
      payloadBytes: Number(meta.payloadBytes || 0),
      updatedBy: String(meta.updatedBy || ""),
      updatedUid: String(meta.updatedUid || ""),
      updatedAt: meta.updatedAt?.toDate ? meta.updatedAt.toDate().toISOString() : String(meta.updatedAt || ""),
      version: Number(meta.version || 1),
      answeredCount: Number(meta.answeredCount || 0),
    };
  } catch (error) {
    throw new Error(explainError(error));
  }
}

export async function uploadFullMemoryBackup(buildPayloadFn) {
  try {
    const user = await getCurrentUser();
    if (typeof buildPayloadFn !== "function") throw new Error("找不到完整資料匯出函式。");

    const localMeta = readLocalUploadMeta();
    const lastAt = Date.parse(String(localMeta.uploadedAt || ""));
    if (Number.isFinite(lastAt) && Date.now() - lastAt < MIN_UPLOAD_INTERVAL_MS) {
      throw new Error("距離上次成功上傳不到 60 秒，請稍後再試，避免重複寫入。");
    }

    const rawPayload = buildPayloadFn();
    const payload = optimizePayloadForCloud(rawPayload);
    const json = JSON.stringify(payload);
    const payloadBytes = new TextEncoder().encode(json).length;
    const checksum = await sha256Hex(json);
    const chunks = splitIntoChunks(json);
    if (payloadBytes > MAX_TOTAL_BYTES || chunks.length > MAX_CHUNKS) {
      throw new Error(`完整資料備份偏大，為保守控制雲端用量，目前限制最多 ${MAX_CHUNKS} 塊、總量約 ${(MAX_TOTAL_BYTES / (1024 * 1024)).toFixed(2)} MiB。系統已先自動移除未作答題與可重算總表；若仍超限，請改用本機 JSON 匯出。`);
    }
    const answeredCount = getAnsweredCountFromPayload(payload);
    const metaRef = syncMetaRef(user);

    const metaSnap = await getDoc(metaRef);
    const previousMeta = metaSnap.exists() ? (metaSnap.data() || {}) : {};
    if (previousMeta.checksum === checksum) {
      writeLocalUploadMeta({ checksum, answeredCount, uploadedAt: nowIso() });
      return {
        ok: true,
        skipped: true,
        message: `雲端內容與本機相同，略過上傳。\nchecksum=${checksum.slice(0, 12)}…`,
      };
    }

    for (let i = 0; i < chunks.length; i += 1) {
      await setDoc(syncChunkRef(user, i), {
        index: i,
        checksum,
        data: chunks[i],
      }, { merge: false });
    }

    const oldChunkCount = Number(previousMeta.chunkCount || 0);
    for (let i = chunks.length; i < oldChunkCount; i += 1) {
      await deleteDoc(syncChunkRef(user, i));
    }

    await setDoc(metaRef, {
      app: APP_ID,
      type: "full-memory-export",
      version: Number(payload?.version || 1),
      schemaVersion: 1,
      checksum,
      chunkCount: chunks.length,
      payloadBytes,
      updatedAt: serverTimestamp(),
      updatedBy: user.email || "",
      updatedUid: user.uid,
      answeredCount,
    }, { merge: true });

    writeLocalUploadMeta({ checksum, answeredCount, uploadedAt: nowIso() });

    return {
      ok: true,
      skipped: false,
      checksum,
      chunkCount: chunks.length,
      payloadBytes,
      answeredCount,
      message: `雲端備份已上傳。\nchunks=${chunks.length} | bytes=${payloadBytes} | checksum=${checksum.slice(0, 12)}…`,
    };
  } catch (error) {
    throw new Error(explainError(error));
  }
}

export async function downloadFullMemoryBackup() {
  try {
    const user = await getCurrentUser();
    const metaRef = syncMetaRef(user);
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) throw new Error("雲端尚無完整資料備份。");

    const meta = metaSnap.data() || {};
    const chunkCount = Number(meta.chunkCount || 0);
    if (!Number.isFinite(chunkCount) || chunkCount <= 0) throw new Error("雲端備份資訊無效：chunkCount 異常。");

    const pieces = [];
    for (let i = 0; i < chunkCount; i += 1) {
      const snap = await getDoc(syncChunkRef(user, i));
      if (!snap.exists()) throw new Error(`雲端備份缺少 chunk ${i}。`);
      const data = snap.data() || {};
      pieces.push(String(data.data || ""));
    }

    const json = pieces.join("");
    const checksum = await sha256Hex(json);
    if (meta.checksum && checksum !== meta.checksum) {
      throw new Error("雲端備份校驗失敗：checksum 不一致。");
    }

    return {
      ok: true,
      checksum,
      payload: JSON.parse(json),
      meta: {
        checksum: String(meta.checksum || checksum),
        chunkCount,
        payloadBytes: Number(meta.payloadBytes || new TextEncoder().encode(json).length),
        updatedBy: String(meta.updatedBy || ""),
        updatedUid: String(meta.updatedUid || ""),
        updatedAt: meta.updatedAt?.toDate ? meta.updatedAt.toDate().toISOString() : String(meta.updatedAt || ""),
        answeredCount: Number(meta.answeredCount || 0),
      },
      message: `雲端備份已下載。\nchunks=${chunkCount} | checksum=${String(meta.checksum || checksum).slice(0, 12)}…`,
    };
  } catch (error) {
    throw new Error(explainError(error));
  }
}
