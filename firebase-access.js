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
    return "沒有權限讀寫同步申請資料。請確認 Firestore Rules 已更新為 access_requests / allowlist 審核流程版本。";
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

export function getAccessRequestRef(uid) {
  return doc(db, "access_requests", uid);
}

export function getAllowlistRef(uid) {
  return doc(db, "allowlist", uid);
}

export async function getSyncAccessStatus() {
  const user = await getCurrentUser();
  try {
    const [allowSnap, requestSnap] = await Promise.all([
      getDoc(getAllowlistRef(user.uid)),
      getDoc(getAccessRequestRef(user.uid)),
    ]);

    const allowData = allowSnap.exists() ? (allowSnap.data() || {}) : null;
    const requestData = requestSnap.exists() ? (requestSnap.data() || {}) : null;
    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
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
    await setDoc(getAccessRequestRef(user.uid), {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      appId: APP_NAMESPACE,
      status: "pending",
      message: cleanMessage,
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return await getSyncAccessStatus();
  } catch (error) {
    throw new Error(explainPermissionError(error));
  }
}
