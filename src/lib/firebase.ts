// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "tamra-vault",
  "appId": "1:715513488301:web:415d81e618f293455eb724",
  "storageBucket": "tamra-vault.firebasestorage.app",
  "apiKey": "AIzaSyAGlSNC3Fazz4Vm1p72rifBER9ruxN44RY",
  "authDomain": "tamra-vault.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "715513488301"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Ld-pAYqAAAAANb2xV5-B47-s0d3B6vF_e3jG-kP'),
    isTokenAutoRefreshEnabled: true
  });
}


const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore, sendEmailVerification };
