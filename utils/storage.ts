import AsyncStorage from "@react-native-async-storage/async-storage";

const SOLVED_WORDS_KEY = "solved_words";

export const addSolvedWord = async (word: string) => {
  try {
    const existing = await AsyncStorage.getItem(SOLVED_WORDS_KEY);
    const solved = existing ? JSON.parse(existing) : [];
    const updated = [...new Set([...solved, word])];
    await AsyncStorage.setItem(SOLVED_WORDS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving solved word:", error);
  }
};

export const getSolvedWords = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(SOLVED_WORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading solved words:", error);
    return [];
  }
};

export const clearSolvedWords = async () => {
  await AsyncStorage.removeItem(SOLVED_WORDS_KEY);
};