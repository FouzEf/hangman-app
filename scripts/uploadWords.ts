import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";
//import words from "../words.json";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyB7DwxNsCZak5Tt2M5rufSb2RgjdtXgpXQ",
  authDomain: "hangman-aeeb2.firebaseapp.com",
  projectId: "hangman-aeeb2",
  storageBucket: "hangman-aeeb2.appspot.com",
  messagingSenderId: "444019570817",
  appId: "1:444019570817:android:95b9121fd9dddc9695b580"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadHangmanWords = async () => {
  try {
    const wordCollection = collection(db, "HangManWOrds");

      for (const item of {/*words*/}) {
      await addDoc(wordCollection, {
        word: item.word,
        level: item.level,
      });
    }

   // console.log("✅ All words uploaded successfully!");

    // Delete local file
   fs.unlink("./words.json", (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("⚠️ Could not delete words.json:", err);
  } else {
    console.log("🗑️ words.json deleted locally.");
  }
});
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};

uploadHangmanWords();