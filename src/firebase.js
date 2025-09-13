
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCUQom8Jv1muj8JYQ2JJyzhAwfX2c_snNA",
  authDomain: "etacontroleapp.firebaseapp.com",
  projectId: "etacontroleapp",
  storageBucket: "etacontroleapp.firebasestorage.app",
  messagingSenderId: "890130340354",
  appId: "1:890130340354:web:50b7e62cc86738cd32651b",
  measurementId: "G-H8Y4XWJLK1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app);