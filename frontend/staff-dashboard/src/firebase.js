import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyB-ceSVALKlT3vp-JQhizVSFbQm2WQtRNw",
  authDomain:        "aegis-app-286ce.firebaseapp.com",
  projectId:         "aegis-app-286ce",
  storageBucket:     "aegis-app-286ce.firebasestorage.app",
  messagingSenderId: "955140462441",
  appId:             "1:955140462441:web:0dc6b560d194f150358ff8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
