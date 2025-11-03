// ✅ Mocks must come before imports to ensure they apply correctly
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

import { jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { fetchWordsOnce } from "../utils/CheckLevelCompletion";

describe("fetchWordsOnce", () => {
  const getItemMock = AsyncStorage.getItem as jest.MockedFunction<
    typeof AsyncStorage.getItem
  >;
  const setItemMock = AsyncStorage.setItem as jest.MockedFunction<
    typeof AsyncStorage.setItem
  >;
  const getDocsMock = getDocs as jest.MockedFunction<typeof getDocs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches words from Firestore and caches them", async () => {
    getItemMock.mockResolvedValue(null);

    getDocsMock.mockResolvedValue({
      docs: [
        {
          data: () => ({ word: "apple" }),
        } as unknown as QueryDocumentSnapshot<DocumentData>,
        {
          data: () => ({ word: "banana" }),
        } as unknown as QueryDocumentSnapshot<DocumentData>,
      ],
    } as unknown as QuerySnapshot<DocumentData>);

    const words = await fetchWordsOnce("Easy");

    expect(words).toEqual(["apple", "banana"]);
    expect(setItemMock).toHaveBeenCalledWith(
      "words_Easy",
      JSON.stringify(["apple", "banana"])
    );
  });

  it("returns cached words if available", async () => {
    getItemMock.mockImplementation((key) => {
      return key === "words_Easy"
        ? Promise.resolve(JSON.stringify(["cached", "words"]))
        : Promise.resolve(null);
    });

    const words = await fetchWordsOnce("Easy");

    expect(words).toEqual(["cached", "words"]);
    // expect(getDocsMock).not.toHaveBeenCalled();
    expect(setItemMock).not.toHaveBeenCalled();
  });
});
