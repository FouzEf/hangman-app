import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { DB } from "./fireBaseConfig";

export const fetchWordsOnce = async (
  level: "Easy" | "medium" | "hard" | "Test" 
): Promise<string[]> => {
  const cacheKey = `words_${level}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  const cachedWords = cached ? JSON.parse(cached) : [];

  const snapshot = await getDocs(collection(DB, level));
  const firestoreWords = snapshot.docs.map((doc) => doc.data().word);

  // ✅ Update cache only if Firestore has more words
  if (firestoreWords.length > cachedWords.length) {
    console.log("Updating cache with new words from Firestore");
    await AsyncStorage.setItem(cacheKey, JSON.stringify(firestoreWords));
    return firestoreWords;
  }

  console.log("Using cached data");
  return cachedWords;
};
