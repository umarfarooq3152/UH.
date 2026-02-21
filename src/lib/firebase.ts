import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDk0XshnJztZxXVNLGw9o5PQy40ir7czQU",
  authDomain: "umars-hands.firebaseapp.com",
  projectId: "umars-hands",
  storageBucket: "umars-hands.firebasestorage.app",
  messagingSenderId: "126429070626",
  appId: "1:126429070626:web:35499346c5ddcbdfb8917b",
  measurementId: "G-HFN2MCMQMB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
