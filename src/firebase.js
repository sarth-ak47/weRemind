// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQHUF_cguPngC2QdD4-Bz6oSkl7-dVv18",
  authDomain: "weremind1.firebaseapp.com",
  projectId: "weremind1",
  storageBucket: "weremind1.appspot.com",
  messagingSenderId: "733726808437",
  appId: "1:733726808437:web:c80f2b173d54fbd27cdb3c",
  measurementId: "G-2Y80NYK48Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the auth object for use in AuthContext.js
export const auth = getAuth(app);

export default app;