import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { DB } from "./fireBaseConfig";


export const fetchWordsOnce = async (
  level: "Easy" | "medium" | "hard" | "Test"
): Promise<string[]> => {
  const cacheKey = `words_${level}`;

  // Try to get cached words
  const cached = await AsyncStorage.getItem(cacheKey);
  const cachedWords: string[] = cached ? JSON.parse(cached) : [];

  // Always fetch from Firestore to compare
  const snapshot = await getDocs(collection(DB, level));
  const firestoreWords: string[] = snapshot.docs.map((doc) => doc.data().word);

  // If Firestore has more words, update the cache
  if (firestoreWords.length > cachedWords.length) {
    console.log(`New words detected in ${level} — updating cache`);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(firestoreWords));
    return firestoreWords;
  }

  console.log(`Using cached words for ${level}`);
  return cachedWords;
};
