"use client";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
