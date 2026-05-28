import AsyncStorage from "@react-native-async-storage/async-storage";

const SOLVED_WORDS_KEY = "solved_words";

export const addSolvedWord = async (word: string, _level?: string) => {
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

const ONBOARDING_KEY = "has_seen_onboarding";

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
};

export const markOnboardingSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // ignore
  }
};
