import { auth, db } from "./firebase-init.js";
import { loginWithGoogle, logoutFirebase, watchAuthState, finishRedirectLogin } from "./firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const pendingList = $("pendingList");
const approvedList = $("approvedList");
const adminOutput = $("adminOutput");
const adminUser = $("adminUser");
const btnLogin = $("btnAdminLogin");
const btnLogout = $("btnAdminLogout");
const btnRefresh = $("btnRefreshRequests");

let currentUser = null;

function setOutput(message) {
  if (adminOutput) adminOutput.textContent = message || "";
}

function text(value) {
  return String(value ?? "");
}

function timestampToText(value) {
  try {
    if (value?.toDate) return value.toDate().toLocaleString();
  } catch {}
  return value ? String(value) : "";
}

function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRequestCard(item) {
  const uid = item.id;
  const d = item.data || {};
  const status = text(d.status || "pending");
  const disabled = status !== "pending" ? "disabled" : "";
  return `
    <article class="admin-card" data-uid="${escapeHtml(uid)}" data-email="${escapeHtml(d.email || "")}">
      <div class="admin-card-main">
        <strong>${escapeHtml(d.displayName || d.email || uid)}</strong>
        <div class="muted">${escapeHtml(d.email || "")}</div>
        <div class="muted">UID: <code>${escapeHtml(uid)}</code></div>
        <div class="muted">狀態：${escapeHtml(status)} ｜ 申請時間：${escapeHtml(timestampToText(d.requestedAt))}</div>
        ${d.message ? `<p>${escapeHtml(d.message)}</p>` : ""}
      </div>
      <div class="admin-card-actions">
        <button type="button" class="approve-btn" ${disabled}>核准</button>
        <button type="button" class="reject-btn" ${disabled}>拒絕</button>
      </div>
    </article>`;
}

function renderAllowCard(item) {
  const uid = item.id;
  const d = item.data || {};
  const enabled = !!d.enabled;
  return `
    <article class="admin-card" data-uid="${escapeHtml(uid)}" data-email="${escapeHtml(d.email || "")}">
      <div class="admin-card-main">
        <strong>${escapeHtml(d.email || uid)}</strong>
        <div class="muted">UID: <code>${escapeHtml(uid)}</code></div>
        <div class="muted">狀態：${enabled ? "已啟用" : "已停用"} ｜ 核准時間：${escapeHtml(timestampToText(d.approvedAt))}</div>
      </div>
      <div class="admin-card-actions">
        <button type="button" class="disable-btn">停用</button>
        <button type="button" class="enable-btn">重新啟用</button>
      </div>
    </article>`;
}

async function loadRequests() {
  if (!currentUser) {
    setOutput("請先登入管理者帳號。");
    return;
  }
  setOutput("讀取申請列表中...");
  try {
    const [reqSnap, allowSnap] = await Promise.all([
      getDocs(collection(db, "access_requests")),
      getDocs(collection(db, "allowlist")),
    ]);
    const requests = reqSnap.docs.map((d) => ({ id: d.id, data: d.data() || {} }));
    const pending = requests.filter((x) => String(x.data.status || "pending") === "pending");
    const reviewed = requests.filter((x) => String(x.data.status || "pending") !== "pending");
    const allowed = allowSnap.docs.map((d) => ({ id: d.id, data: d.data() || {} }));

    pendingList.innerHTML = pending.length
      ? pending.map(renderRequestCard).join("")
      : `<div class="empty">目前沒有待審核申請。</div>`;

    approvedList.innerHTML = [
      ...allowed.map(renderAllowCard),
      ...reviewed.map(renderRequestCard),
    ].join("") || `<div class="empty">目前沒有已審核紀錄。</div>`;

    setOutput(`讀取完成：待審核 ${pending.length} 筆，白名單 ${allowed.length} 筆。`);
  } catch (err) {
    console.error(err);
    setOutput("讀取失敗：\n" + (err?.message || String(err)) + "\n\n請確認 Firestore 已建立 admins/{目前登入帳號UID}，且 enabled 為 Boolean true；同時 app_config/global.syncEnabled 為 Boolean true，並已發布新版 firestore.rules。");
  }
}

async function approveUser(uid, email) {
  const batch = writeBatch(db);
  batch.set(doc(db, "allowlist", uid), {
    enabled: true,
    email: email || "",
    role: "user",
    approvedAt: serverTimestamp(),
    approvedBy: currentUser.uid,
  }, { merge: true });
  batch.set(doc(db, "access_requests", uid), {
    status: "approved",
    reviewedAt: serverTimestamp(),
    reviewedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  await batch.commit();
}

async function rejectUser(uid) {
  const batch = writeBatch(db);
  batch.set(doc(db, "access_requests", uid), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
    reviewedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  await batch.commit();
}

async function setAllowEnabled(uid, email, enabled) {
  const batch = writeBatch(db);
  batch.set(doc(db, "allowlist", uid), {
    enabled: !!enabled,
    email: email || "",
    role: "user",
    updatedAt: serverTimestamp(),
    updatedBy: currentUser.uid,
  }, { merge: true });
  await batch.commit();
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest(".admin-card");
  if (!card) return;
  const uid = card.getAttribute("data-uid") || "";
  const email = card.getAttribute("data-email") || "";
  if (!uid) return;
  try {
    target.setAttribute("disabled", "disabled");
    if (target.classList.contains("approve-btn")) {
      await approveUser(uid, email);
      setOutput(`已核准 ${email || uid}`);
    } else if (target.classList.contains("reject-btn")) {
      await rejectUser(uid);
      setOutput(`已拒絕 ${email || uid}`);
    } else if (target.classList.contains("disable-btn")) {
      await setAllowEnabled(uid, email, false);
      setOutput(`已停用 ${email || uid}`);
    } else if (target.classList.contains("enable-btn")) {
      await setAllowEnabled(uid, email, true);
      setOutput(`已重新啟用 ${email || uid}`);
    } else {
      return;
    }
    await loadRequests();
  } catch (err) {
    console.error(err);
    setOutput("操作失敗：\n" + (err?.message || String(err)));
  } finally {
    target.removeAttribute("disabled");
  }
});

btnLogin?.addEventListener("click", async () => {
  try {
    setOutput("登入中...");
    await loginWithGoogle();
  } catch (err) {
    console.error(err);
    setOutput("登入失敗：" + (err?.message || String(err)));
  }
});

btnLogout?.addEventListener("click", async () => {
  await logoutFirebase();
});

btnRefresh?.addEventListener("click", () => loadRequests());

try {
  await finishRedirectLogin();
} catch (err) {
  console.error(err);
}

watchAuthState(async (user) => {
  currentUser = user || null;
  if (currentUser) {
    adminUser.textContent = `已登入：${currentUser.email || currentUser.uid}\nUID：${currentUser.uid}`;
    btnLogin.style.display = "none";
    btnLogout.style.display = "";
    btnRefresh.disabled = false;
    await loadRequests();
  } else {
    adminUser.textContent = "尚未登入。";
    btnLogin.style.display = "";
    btnLogout.style.display = "none";
    btnRefresh.disabled = true;
    pendingList.innerHTML = `<div class="empty">登入管理者帳號後顯示。</div>`;
    approvedList.innerHTML = `<div class="empty">登入管理者帳號後顯示。</div>`;
    setOutput("請使用管理者 Google 帳號登入。");
  }
});
