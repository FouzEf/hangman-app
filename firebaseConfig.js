// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7DwxNsCZak5Tt2M5rufSb2RgjdtXgpXQ", // <--- Get this from your registered Web App in Firebase Console
  authDomain: "hangman-aeeb2.firebaseapp.com",
  projectId: "hangman-aeeb2",
  storageBucket: "hangman-aeeb2.appspot.com",
  messagingSenderId: "444019570817",
  appId: "1:444019570817:android:95b9121fd9dddc9695b580", // <--- Get this from your registered Web App in Firebase Console
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
