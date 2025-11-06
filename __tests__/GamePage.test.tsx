// __tests__/GamePage.test.tsx
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react-native";
import { act } from "react-test-renderer";

// Assuming your component is located at '../app/gamePage/index'
import GamePage from "../app/gamePage/index";

// ----------------------------------------------------------------------
// 1. MOCK UTILITIES FIX: Define central mock functions
// ----------------------------------------------------------------------
const mockFetchWordsOnce = jest.fn();
const mockAddSolvedWord = jest.fn();

// Mock paths where fetchWordsOnce might be imported (FIX for: TypeError: ...mockResolvedValue is not a function)
jest.mock("../WordService", () => ({ fetchWordsOnce: mockFetchWordsOnce })); // Common path

// Mock Storage utilities
jest.mock("../utils/storage", () => ({
  addSolvedWord: mockAddSolvedWord,
  getSolvedWords: jest.fn().mockResolvedValue([]),
}));

// --- NATIVE MODULE MOCKS TO PREVENT CRASHES ---

// Mock for expo-linear-gradient (prevents the initial import warning/crash)
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient", // Mock it as a simple string component
}));

// Mock for expo-av (essential for HeadphoneButton/audio components)
jest.mock("expo-av", () => {
  const mockSound = {
    loadAsync: jest.fn().mockResolvedValue({ status: {} }),
    playAsync: jest.fn(),
    pauseAsync: jest.fn(),
    stopAsync: jest.fn(),
    unloadAsync: jest.fn(),
    getStatusAsync: jest.fn().mockResolvedValue({
      isLoaded: true,
      isPlaying: false,
      didJustFinish: false,
    }),
    setOnPlaybackStatusUpdate: jest.fn(),
  };
  return {
    Audio: {
      Sound: jest.fn(() => mockSound),
      setAudioModeAsync: jest.fn(),
    },
    useForegroundPermissions: jest
      .fn()
      .mockReturnValue([{ granted: true }, jest.fn()]),
    usePermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
  };
});

// ----------------------------------------------------------------------
// 2. ROUTER MOCKS
// ----------------------------------------------------------------------
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};
const mockSearchParams = { selectedLevel: "Easy" };

jest.mock("expo-router", () => {
  const React = require("react");
  const ActualModule = jest.requireActual("expo-router");

  return {
    ...ActualModule,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockSearchParams,
    // Mock for Link component to prevent navigation errors
    Link: ({ href, children, onPress, ...rest }: any) => (
      <ActualModule.Link href={href} onPress={onPress} {...rest}>
        {children}
      </ActualModule.Link>
    ),
  };
});

// ----------------------------------------------------------------------
// 3. TEST SETUP & CONSTANTS
// ----------------------------------------------------------------------

// Mocked words
const SECRET_WORD_1 = "HANGMAN";
const CORRECT_LETTERS_1 = ["H", "A", "N", "G", "M"];
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"]; // 6 letters

const SECRET_WORD_2 = "NEXT";
const CORRECT_LETTERS_2 = ["N", "E", "X", "T"];
const INCORRECT_LETTERS_2 = ["Q", "W", "S", "D", "Z", "X"];

// Reset mocks before each test
beforeEach(() => {
  cleanup();
  jest.clearAllMocks();

  // Mock the word service to return two words sequentially
  mockFetchWordsOnce
    .mockResolvedValueOnce(SECRET_WORD_1) // First call returns HANGMAN
    .mockResolvedValueOnce(SECRET_WORD_2); // Second call returns NEXT
});

// ----------------------------------------------------------------------
// 4. TESTS
// ----------------------------------------------------------------------

describe("GamePage (Core Logic)", () => {
  it("should initialize with the correct level and fetch a word", async () => {
    render(<GamePage />);

    // 1. Wait for word fetch (SECRET_WORD_1) to complete
    await waitFor(() => {
      // Expect 7 underscores for "HANGMAN"
      expect(screen.getAllByText("_").length).toBe(7);
    });

    // 2. ASSERT: The correct word was fetched
    expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy", []);
    expect(screen.queryByText(SECRET_WORD_1)).toBeNull(); // Should not be visible

    // 3. ASSERT: The current wrong guesses counter is 0
    expect(screen.getByText("0/6")).toBeOnTheScreen();
  });

  it("should increase wrongGuesses on incorrect guess and disable the key", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    const incorrectLetter = INCORRECT_LETTERS_1[0]; // 'B'

    // 1. ACT: Guess an incorrect letter
    await act(async () => {
      fireEvent.press(screen.getByText(incorrectLetter));
    });

    // 2. ASSERT: Wrong guesses updated
    expect(screen.getByText("1/6")).toBeOnTheScreen();

    // 3. ASSERT: The key is disabled (check for its presence, but expect the parent button to be disabled)
    // Checking for the text content on screen is usually sufficient
    expect(screen.getByText(incorrectLetter)).toBeOnTheScreen(); // Text is visible

    // 4. ACT: Try pressing the key again
    await act(async () => {
      fireEvent.press(screen.getByText(incorrectLetter));
    });

    // 5. ASSERT: Wrong guesses did not change (guess was ignored)
    expect(screen.getByText("1/6")).toBeOnTheScreen();
  });

  it("should handle a correct letter guess, revealing letters and disabling the key", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    const correctLetter = CORRECT_LETTERS_1[0]; // 'H' - appears once

    // 1. ACT: Guess a correct letter
    await act(async () => {
      fireEvent.press(screen.getByText(correctLetter));
    });

    // 2. ASSERT: Letter is revealed, underscores are reduced/replaced
    expect(screen.getByText(correctLetter)).toBeOnTheScreen();
    // 7 total letters, 'H' is one, so 6 underscores left
    expect(screen.getAllByText("_").length).toBe(6);

    // 3. ASSERT: Wrong guesses did not increase
    expect(screen.getByText("0/6")).toBeOnTheScreen();

    // 4. ACT: Try pressing the key again
    await act(async () => {
      fireEvent.press(screen.getByText(correctLetter));
    });

    // 5. ASSERT: State is unchanged
    expect(screen.getAllByText("_").length).toBe(6);
    expect(screen.getByText("0/6")).toBeOnTheScreen();
  });

  it("should show WIN modal when solving the word", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for initial load of SECRET_WORD_1 ("HANGMAN")

    // 1. ACT: Guess all correct letters
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 2. ASSERT: WIN modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
      // Expect the solved word to be visible in the modal
      expect(screen.getByText(SECRET_WORD_1)).toBeOnTheScreen();
    });

    // 3. ASSERT: addSolvedWord called once for the solved word
    expect(mockAddSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1, "Easy");
  });

  it("should show LOSE modal after 6 wrong guesses", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // 1. ACT: Make 6 incorrect guesses
    for (let i = 0; i < INCORRECT_LETTERS_1.length; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_1[i]));
      });
    }

    // 2. ASSERT: Wrong guesses counter is 6/6
    expect(screen.getByText("6/6")).toBeOnTheScreen();

    // 3. ASSERT: LOSE modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
      // Expect the secret word to be revealed in the modal
      expect(screen.getByText(SECRET_WORD_1)).toBeOnTheScreen();
    });
    // 4. ASSERT: addSolvedWord is NOT called on a loss
    expect(mockAddSolvedWord).not.toHaveBeenCalled();
  });

  it("should disable the keyboard and prevent further guesses when the game is over (loss)", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // 1. ACT: Force a Loss
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_1[i]));
      });
    }

    // Wait for the loss modal to show
    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // 2. ACT: Try to press one more incorrect key (the 7th key)
    const seventhIncorrectLetter = "J";
    await act(async () => {
      fireEvent.press(screen.getByText(seventhIncorrectLetter));
    });

    // 3. ASSERT: The wrong guesses count remains at 6/6
    expect(screen.getByText("6/6")).toBeOnTheScreen();
  });

  // ----------------------------------------------------------------------
  // Test game continuation after a win/loss
  // ----------------------------------------------------------------------
  it("should reset state and load a new word when 'Continue' is pressed after a win", async () => {
    render(<GamePage />);
    await act(async () => {}); // 1. Wait for initial load of SECRET_WORD_1 ("HANGMAN")

    // 2. ACT: Force a Win (Guess all letters)
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 3. ASSERT: Win modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    // 4. ACT: Press 'Continue' (to load SECRET_WORD_2: "NEXT")
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    // 5. ASSERT: Game state is reset
    expect(screen.getByText("0/6")).toBeOnTheScreen();
    expect(screen.getAllByText("_").length).toBe(4); // "NEXT" has 4 letters

    // 6. ASSERT: The previous word is no longer shown
    expect(screen.queryByText(SECRET_WORD_1)).toBeNull();
  });

  it("should handle Win (Word 1) followed by Loss (Word 2) correctly, only counting the win", async () => {
    render(<GamePage />);
    await act(async () => {}); // 1. Wait for initial load of SECRET_WORD_1 ("HANGMAN")

    // --- A. TEST WIN SCENARIO (Word 1) ---
    // 2. ACT: Force a Win (Guess all letters) on the first word
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 3. ASSERT: addSolvedWord called once for HANGMAN
    await waitFor(() => {
      expect(mockAddSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1, "Easy");
      expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
    });

    // 4. ACT: Press 'Continue' (to load SECRET_WORD_2)
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    // --- B. TEST LOSS SCENARIO (Word 2) ---
    // 4. ACT: Force a Loss (6 incorrect guesses) on the new word (SECRET_WORD_2)
    const INCORRECT_LETTERS_2 = ["Q", "W", "S", "D", "Z", "X"]; // 6 letters not in NEXT
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_2[i]));
      });
    }

    // 5. ASSERT: Loss modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // 6. ASSERT: addSolvedWord is NOT called again (total calls remains 1 from the win)
    expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
  });

  it("should navigate home when pressing To Home", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Force the modal to appear (e.g., force a win)
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("To Home")).toBeOnTheScreen();
    });

    // ACT: Press the navigation button
    await act(async () => {
      fireEvent.press(screen.getByText("To Home"));
    });

    // ASSERT: Router push was called
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  // ----------------------------------------------------------------------
  // Test Level Completion Check (using the addSolvedWord mock count)
  // ----------------------------------------------------------------------
  it("should check level completion status when 10 words are solved", async () => {
    // 1. Arrange: Mock initial state to simulate 9 words already solved
    jest.mock("../utils/storage", () => ({
      addSolvedWord: mockAddSolvedWord,
      // Simulate 9 solved words
      getSolvedWords: jest
        .fn()
        .mockResolvedValue([
          "WORD1",
          "WORD2",
          "WORD3",
          "WORD4",
          "WORD5",
          "WORD6",
          "WORD7",
          "WORD8",
          "WORD9",
        ]),
    }));

    // Ensure the mock is correctly configured for the test
    mockAddSolvedWord.mockClear(); // Ensure the count is reset for this specific test

    render(<GamePage />);
    await act(async () => {}); // 1. Wait for initial load of SECRET_WORD_1 ("HANGMAN")

    // 2. ACT: Force a Win (Guess all letters) - This is the 10th solved word
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 3. ASSERT: Win modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    // 4. ASSERT: addSolvedWord was called for the 10th word
    expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);

    // 5. ASSERT: CheckLevelCompletion.test.ts verifies the navigation to WinPage
    // Here we can only verify the push to the router happens after the 10th win
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    // Check if WinPage navigation was triggered
    expect(mockRouter.push).toHaveBeenCalledWith("winPage");
  });
});
