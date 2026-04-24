import { auth, db } from "./firebase-init.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const APP_NAMESPACE = "med-exam-app";

function syncMetaRef(user) {
  return doc(db, "apps", APP_NAMESPACE, "users", user.uid, "sync", "meta");
}

function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("尚未登入");
  return user;
}

export async function smokeWrite() {
  const user = requireUser();
  const ref = syncMetaRef(user);
  await setDoc(ref, {
    schemaVersion: 1,
    updatedAt: serverTimestamp(),
    updatedBy: user.email || "",
    testValue: "hello-firestore"
  }, { merge: true });
  return true;
}

export async function smokeRead() {
  const user = requireUser();
  const ref = syncMetaRef(user);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
