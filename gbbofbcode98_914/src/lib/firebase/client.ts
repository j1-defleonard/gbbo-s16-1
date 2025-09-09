
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7ONp-aRdT78oVtyid6m5-zbrJAslz84c",
  authDomain: "gbbo-6-test.firebaseapp.com",
  projectId: "gbbo-6-test",
  storageBucket: "gbbo-6-test.firebasestorage.app",
  messagingSenderId: "677218281936",
  appId: "1:677218281936:web:f557e1edc238294380b1d5",
  measurementId: "G-262FR5SCLX"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
