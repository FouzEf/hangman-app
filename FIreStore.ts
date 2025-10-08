import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { DB } from "./fireBaseConfig";

export const fetchWordsOnce = async (level: "easy" | "medium" | "hard"): Promise<string[]> => {
  const cacheKey = `words_${level}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    console.log("Using cached data");
    return JSON.parse(cached);
  }

  console.log("Fetching from Firestore");
  const snapshot = await getDocs(collection(DB, level));
  const words = snapshot.docs.map(doc => doc.data().word);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(words));
  return words;
};