import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const APP_NAMESPACE = "med-exam-app";

async function getCurrentUser(waitMs = 4000) {
  const started = Date.now();
  while (Date.now() - started < waitMs) {
    const user = auth.currentUser;
    if (user) return user;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error("尚未登入 Google，或登入狀態尚未完成同步。請稍候再試一次。");
}

function explainPermissionError(error) {
  const msg = error?.message || String(error || "");
  if (/Missing or insufficient permissions/i.test(msg)) {
    return [
      "沒有權限讀寫同步申請資料。",
      "請確認 Cloud Firestore Rules 已更新為本版 firestore.rules，且 app_config/global.syncEnabled 為 true。",
      "若你是管理者，請確認 app_config/global.adminUids 陣列已包含你的 Firebase Authentication UID。"
    ].join("\n");
  }
  return msg || "未知錯誤";
}

function plainTimestamp(value) {
  if (!value) return "";
  try {
    if (typeof value.toDate === "function") return value.toDate().toISOString();
  } catch {}
  return String(value || "");
}

export function getGlobalConfigRef() {
  return doc(db, "app_config", "global");
}

export function getAccessRequestRef(uid) {
  return doc(db, "access_requests", uid);
}

export function getAllowlistRef(uid) {
  return doc(db, "allowlist", uid);
}

export async function getGlobalSyncConfig() {
  try {
    const snap = await getDoc(getGlobalConfigRef());
    if (!snap.exists()) {
      return {
        exists: false,
        appId: "",
        syncEnabled: false,
        hasAdminUids: false,
      };
    }
    const data = snap.data() || {};
    const adminUids = Array.isArray(data.adminUids) ? data.adminUids : [];
    return {
      exists: true,
      appId: String(data.appId || ""),
      syncEnabled: data.syncEnabled === true,
      hasAdminUids: adminUids.length > 0,
      adminCount: adminUids.length,
      note: String(data.note || ""),
    };
  } catch (error) {
    throw new Error(explainPermissionError(error));
  }
}

export async function getSyncAccessStatus() {
  const user = await getCurrentUser();
  try {
    const [config, allowSnap, requestSnap] = await Promise.all([
      getGlobalSyncConfig(),
      getDoc(getAllowlistRef(user.uid)),
      getDoc(getAccessRequestRef(user.uid)),
    ]);

    const allowData = allowSnap.exists() ? (allowSnap.data() || {}) : null;
    const requestData = requestSnap.exists() ? (requestSnap.data() || {}) : null;
    return {
      uid: user.uid,
      email: String(user.email || "").slice(0, 254),
      displayName: String(user.displayName || "").slice(0, 120),
      syncEnabled: !!config.syncEnabled,
      configExists: !!config.exists,
      configAppId: config.appId || "",
      allowlisted: !!allowData?.enabled,
      allowlistExists: allowSnap.exists(),
      requestExists: requestSnap.exists(),
      requestStatus: String(requestData?.status || "none"),
      requestedAt: plainTimestamp(requestData?.requestedAt),
      reviewedAt: plainTimestamp(requestData?.reviewedAt),
      reviewedBy: String(requestData?.reviewedBy || ""),
    };
  } catch (error) {
    throw new Error(explainPermissionError(error));
  }
}

export async function requestSyncAccess(message = "") {
  const user = await getCurrentUser();
  const cleanMessage = String(message || "申請醫學題庫雲端同步權限").slice(0, 500);
  try {
    const config = await getGlobalSyncConfig();
    if (!config.exists) {
      throw new Error("尚未建立 app_config/global。請先在 Firestore 建立 global 設定文件。");
    }
    if (!config.syncEnabled) {
      throw new Error("app_config/global.syncEnabled 不是 true，目前不可送出同步申請。");
    }

    await setDoc(getAccessRequestRef(user.uid), {
      uid: user.uid,
      email: String(user.email || "").slice(0, 254),
      displayName: String(user.displayName || "").slice(0, 120),
      photoURL: String(user.photoURL || "").slice(0, 1000),
      appId: APP_NAMESPACE,
      status: "pending",
      message: cleanMessage,
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: false });
    return await getSyncAccessStatus();
  } catch (error) {
    throw new Error(explainPermissionError(error));
  }
}
