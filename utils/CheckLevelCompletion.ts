import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { DB } from "../fireBaseConfig";

/**
 * Fetches words for a given level from Firestore, with smart caching.
 * If Firestore has more words than the cached version, the cache is updated.
 *
 * @param level - The difficulty level ("Easy", "medium", or "hard")
 * @returns A Promise resolving to the word list for that level
 */
export const fetchWordsOnce = async (
  level: "Easy" | "medium" | "hard"
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
