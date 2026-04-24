import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAwO3Bhxcj1dUgRLNsGs2JL4RuiYLq8nL4",
    authDomain: "med-exam-app-f7c58.firebaseapp.com",
    projectId: "med-exam-app-f7c58",
    storageBucket: "med-exam-app-f7c58.firebasestorage.app",
    messagingSenderId: "906279734312",
    appId: "1:906279734312:web:0165465c89656a93b2791d"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();