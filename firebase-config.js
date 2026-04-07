// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAai8mFCTYpylV5DTSpBu2Grt_9Bfz_DWo",
  authDomain: "tesla1-5c71d.firebaseapp.com",
  projectId: "tesla1-5c71d",
  storageBucket: "tesla1-5c71d.firebasestorage.app",
  messagingSenderId: "998795417398",
  appId: "1:998795417398:web:ef046c3d8efaf054078597"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
