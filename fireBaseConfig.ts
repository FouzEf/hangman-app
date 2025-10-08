import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7DwxNsCZak5Tt2M5rufSb2RgjdtXgpXQ",
  authDomain: "hangman-aeeb2.firebaseapp.com",
  projectId: "hangman-aeeb2",
  storageBucket: "hangman-aeeb2.firebasestorage.app",
  messagingSenderId: "444019570817",
  appId: "1:444019570817:android:95b9121fd9dddc9695b580",
};

const app = initializeApp(firebaseConfig);
export const DB = getFirestore(app);
