import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfGueljLagS1qfhECBtGfu7qt-2Ahmmj8",
  authDomain: "travo-reno-dev.firebaseapp.com",
  projectId: "travo-reno-dev",
  storageBucket: "travo-reno-dev.appspot.com",
  messagingSenderId: "562417085313",
  appId: "1:562417085313:web:6546896e4457dc1e7b9680"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 