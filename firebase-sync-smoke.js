import { auth, db } from "./firebase-init.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const APP_NAMESPACE = "med-exam-app";
const APP_ID = "med-exam-pwa";

function smokeRef(user) {
  return doc(db, "apps", APP_NAMESPACE, "users", user.uid, "diagnostics", "smoke");
}

function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("尚未登入");
  return user;
}

export async function smokeWrite() {
  const user = requireUser();
  const ref = smokeRef(user);
  await setDoc(ref, {
    app: APP_ID,
    type: "diagnostic-smoke-test",
    updatedAt: serverTimestamp(),
    updatedBy: String(user.email || "").slice(0, 254),
    updatedUid: user.uid,
    testValue: "hello-firestore"
  }, { merge: false });
  return true;
}

export async function smokeRead() {
  const user = requireUser();
  const ref = smokeRef(user);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
