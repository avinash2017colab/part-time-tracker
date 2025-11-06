import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCVdArlCpgK5BywtPVZaCwjCXYR02h1_iA",
  authDomain: "time-travel-5728a.firebaseapp.com",
  projectId: "time-travel-5728a",
  storageBucket: "time-travel-5728a.firebasestorage.app",
  messagingSenderId: "446918538615",
  appId: "1:446918538615:web:38cbcaa21b4bb5c9241d72",
  measurementId: "G-4DRZJXLF4J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
