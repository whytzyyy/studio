"use client";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
  // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
  // key is the counterpart to the secret key you set in the Firebase console.
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LemvaArAAAAAIDSl6_IU2g0lUokvUBC6K8Kwe2B'),

    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true
  });
}


const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
