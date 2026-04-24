import { auth, googleProvider } from "./firebase-init.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn("setPersistence failed", err);
  }
}

export async function loginWithGoogle() {
  await ensurePersistence();
  return signInWithPopup(auth, googleProvider);
}

export async function finishRedirectLogin() {
  await ensurePersistence();
  return null;
}

export function hasPendingRedirectLogin() {
  return false;
}

export async function logoutFirebase() {
  await signOut(auth);
}

export function watchAuthState(onChange) {
  return onAuthStateChanged(auth, (user) => onChange(user));
}
