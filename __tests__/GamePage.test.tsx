// -----------------------------
// Imports
// -----------------------------
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { act } from "react-test-renderer";

import { SoundSettingsProvider } from "@/audio/SoundSettingsContext";
import GamePage from "../app/gamePage/index";

// -----------------------------
// Word service mock (combined for all exports)
// -----------------------------
const mockFetchWordsOnce = jest.fn();
const mockAddSolvedWord = jest.fn();
const mockGetSolvedCount = jest.fn();

// Use fake timers to control asynchronous operations explicitly
jest.useFakeTimers();

// Ensure all timers are cleaned up after each test
afterEach(() => {
  // FIX: Using clearAllTimers() clears any lingering timers (like setTimeout/setInterval)
  // before restoring real timers, which is the proper cleanup sequence and should
  // resolve both the timer console warning and the "worker process failed" warning.
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Mock for relative path '../WordService'
jest.mock("../WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));

// CONSOLIDATED mock for alias '@/WordService'
jest.mock("@/WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
  addSolvedWord: (...args: any[]) => mockAddSolvedWord(...args),
  getSolvedCount: (...args: any[]) => mockGetSolvedCount(...args),
}));

// -----------------------------
// Router mock
// -----------------------------
const mockRouter = {
  push: jest.fn(),
};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({
    selectedLevel: "Easy",
  }),
}));

// -----------------------------
// Storage mocks
// -----------------------------

// FIX: Mock expo-av to resolve TypeError: Cannot read properties of undefined (reading 'setVolumeAsync')
// The SoundSettingsProvider likely uses functions from this library internally.
jest.mock("expo-av", () => ({
  Audio: {
    Sound: class {
      static createAsync = jest.fn().mockResolvedValue({
        sound: { setVolumeAsync: jest.fn(), unloadAsync: jest.fn() },
      });
      setVolumeAsync = jest.fn().mockResolvedValue(true);
      unloadAsync = jest.fn().mockResolvedValue(true);
      setOnPlaybackStatusUpdate = jest.fn();
      getStatusAsync = jest.fn().mockResolvedValue({});
    },
    setAudioModeAsync: jest.fn().mockResolvedValue(true),
  },
}));

// -----------------------------
// Helper: render with providers
// -----------------------------
function renderWithProviders(ui: React.ReactElement) {
  return render(<SoundSettingsProvider>{ui}</SoundSettingsProvider>);
}

// -----------------------------
// Test data
// -----------------------------
const SECRET_WORD_1 = "HANGMAN";
const SECRET_WORD_2 = "NEXT";

const CORRECT_LETTERS_1 = SECRET_WORD_1.split(""); // H A N G M A N
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"];

beforeEach(() => {
  jest.clearAllMocks();

  mockFetchWordsOnce.mockResolvedValue([SECRET_WORD_1, SECRET_WORD_2]);
  mockGetSolvedCount.mockResolvedValue(0);

  cleanup();
});

// --------------------------------------------------------
// 3) Tests
// --------------------------------------------------------
describe("GamePage (Core Logic)", () => {
  // ------------------------------------------------------
  it("initializes with the correct level and fetches a word", async () => {
    renderWithProviders(<GamePage />);

    await act(async () => {});

    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(7);
    });

    expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy");
    expect(screen.getByText(/^\s*0\s*\/6\s*$/)).toBeOnTheScreen();
  });

  // ------------------------------------------------------
  it("increases wrongGuesses on incorrect guess and disables the key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    const incorrect = INCORRECT_LETTERS_1[0];

    await act(async () => {
      fireEvent.press(screen.getByText(incorrect));
    });

    expect(screen.getByText("1/6")).toBeOnTheScreen();
    expect(screen.getByTestId(`key-${incorrect}`)).toBeDisabled();
  });

  // ------------------------------------------------------
  it("handles a correct letter guess and disables that key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    const correct = CORRECT_LETTERS_1[0];

    await act(async () => {
      fireEvent.press(screen.getByText(correct));
    });

    expect(screen.getByTestId(`key-${correct}`)).toBeDisabled();
    expect(screen.getByText(/^\s*\d\s*\/6\s*$/)).toBeOnTheScreen();
  });
});
