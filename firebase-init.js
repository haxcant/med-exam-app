import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB52jVbXS-rb5rA7lIFrJTnvRB3LTbOTds",
  authDomain: "driver-quiz-sync.firebaseapp.com",
  projectId: "driver-quiz-sync",
  storageBucket: "driver-quiz-sync.firebasestorage.app",
  messagingSenderId: "30111669152",
  appId: "1:30111669152:web:192b8f00aa3fa0b0a222c5"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();