import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 這裡必須填「你正在使用的 Firebase Web App 設定」。
// 目前保留你上傳版本中的設定；若你已建立新的 Firebase project，請到
// Firebase Console → Project settings → Your apps → Web app 複製 firebaseConfig 後替換此區塊。
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

// 只供除錯使用：因為本專案使用 Firebase modular SDK，Console 不會有全域 firebase 物件。
// 可在瀏覽器 Console 輸入：
//   MedExamFirebase.auth.currentUser?.uid
//   MedExamFirebase.app.options.projectId
if (typeof window !== "undefined") {
  window.MedExamFirebase = {
    app,
    auth,
    db,
    googleProvider,
    firebaseConfig: { ...firebaseConfig }
  };
}
