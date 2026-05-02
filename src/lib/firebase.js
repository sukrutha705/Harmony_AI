import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBRDwH0a7dZNk4rnRXfUD3HPsnslz_EK8",
  authDomain: "harmony-ai-b9bb3.firebaseapp.com",
  projectId: "harmony-ai-b9bb3",
  storageBucket: "harmony-ai-b9bb3.firebasestorage.app",
  messagingSenderId: "76949891716",
  appId: "1:76949891716:web:c894962667fa74d3b9f0d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
