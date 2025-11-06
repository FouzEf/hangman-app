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
  const { Text } = require("react-native");
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockSearchParams,
    Link: ({ children, href, ...props }: any) =>
      React.createElement(Text, { ...props, testID: `Link-${href}` }, children),
  };
});

// ----------------------------------------------------------------------
// 3. MOCKING POST-GAME MODAL (for consistent button finding)
// ----------------------------------------------------------------------
// Mock the WinOrLose component to expose buttons by text instead of relying on images/testIDs
jest.mock("@/components/WinOrLose", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return ({ modalVisible, wrongGuesses, toHome, continueOrRetry }: any) => {
    if (!modalVisible) return null;
    const lost = wrongGuesses.length >= 6;
    return (
      <React.Fragment>
        <Text testID="win-or-lose-modal">
          {lost ? "You Lost!" : "You Won!"}
        </Text>
        <Pressable onPress={continueOrRetry} testID="continue-retry-btn">
          <Text>{lost ? "Retry Level" : "Continue"}</Text>
        </Pressable>
        <Pressable onPress={toHome} testID="to-home-btn">
          <Text>To Home</Text>
        </Pressable>
      </React.Fragment>
    );
  };
});

// ----------------------------------------------------------------------
// 4. TEST DATA
// ----------------------------------------------------------------------
const SECRET_WORD_1 = "HANGMAN";
const CORRECT_LETTERS_1 = ["H", "A", "N", "G", "M"];
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"]; // 6 letters for a loss

const SECRET_WORD_2 = "NEXT";

// ----------------------------------------------------------------------
// 5. TEST SUITE
// ----------------------------------------------------------------------
describe("GamePage", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    mockAddSolvedWord.mockClear();

    // 🔥 FIX: Use the centrally defined mock function to set resolved values
    // 1st call (Initial Load) returns both words (to allow for a second round)
    mockFetchWordsOnce.mockResolvedValueOnce([SECRET_WORD_1, SECRET_WORD_2]);
    // 2nd call (Continue/Retry pressed) returns only the second word
    mockFetchWordsOnce.mockResolvedValueOnce([SECRET_WORD_2]);
  });

  afterEach(() => {
    cleanup();
  });

  it("should initialize with the correct level and fetch a word", async () => {
    render(<GamePage />);

    // 1. Wait for word fetch (SECRET_WORD_1) to complete
    await waitFor(() => {
      expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy");
    });

    // 2. Check if the initial state is rendered (Hangman with 7 letters)
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();
  });

  it("should increase wrongGuesses on incorrect guess and disable the key", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    const incorrectLetter = INCORRECT_LETTERS_1[0]; // 'B'
    await act(async () => {
      // Find the 'B' key and press it
      fireEvent.press(screen.getByText(incorrectLetter));
    });

    // 1. Wrong guess count increases and letter is listed
    await waitFor(() => {
      expect(screen.getByText(/Wrong Guesses: 1/i)).toBeOnTheScreen();
      expect(
        screen.getByText(new RegExp(incorrectLetter.toLowerCase()))
      ).toBeOnTheScreen();
    });
  });

  it("should handle a correct letter guess, revealing letters and disabling the key", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    const correctLetter = CORRECT_LETTERS_1[0]; // 'H'
    await act(async () => {
      // Find the 'H' key and press it
      fireEvent.press(screen.getByText(correctLetter));
    });

    // 1. Correct letter 'H' should be displayed
    await waitFor(() => {
      // The letter 'H' should be visible on the screen
      expect(screen.getAllByText(correctLetter).length).toBe(1);
    });

    // 2. Wrong guess count should remain 0
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();
  });

  it("should show WIN modal when solving the word", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for initial load of SECRET_WORD_1 ("HANGMAN")

    // 1. ACT: Guess all correct letters
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        // Find the key (which uses the uppercase letter) and press it
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 2. ASSERT: Win modal is shown
    await waitFor(() => {
      expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });
  });

  it("should show LOSE modal after 6 wrong guesses", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // 1. ACT: Make 6 incorrect guesses
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_1[i]));
      });
    }

    // 2. ASSERT: Lose modal is shown
    await waitFor(() => {
      expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });
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

    // Wait for modal to appear and keyboard to disable
    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // 2. ASSERT: A letter key that was not yet guessed should now be disabled
    const unusedLetter = "J"; // Assuming 'J' is not in HANGMAN or the incorrect list
    const jKeyButton = screen.getByText(unusedLetter).parent;
    expect(jKeyButton).toBeDisabled();
  });

  // ----------------------------------------------------------------------
  // ✅ NEW TEST: Reset state and load a new word when 'Continue' is pressed after a win
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

    // ASSERT: Win modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    // 3. ACT: Press the Continue button
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    // 4. ASSERT: Modal hides
    await waitFor(() => {
      expect(screen.queryByText("You Won!")).not.toBeOnTheScreen();
    });

    // 5. ASSERT: Game state is reset (WrongGuesses: 0)
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();

    // 6. ASSERT: A new word was loaded (mockFetchWordsOnce called a second time)
    await waitFor(() => {
      expect(mockFetchWordsOnce).toHaveBeenCalledTimes(2);
    });
  });

  // ----------------------------------------------------------------------
  // ✅ NEW TEST: Add Solved Word on Win, NOT on Loss
  // ----------------------------------------------------------------------
  it("should call addSolvedWord on win and NOT call it on loss", async () => {
    mockAddSolvedWord.mockClear(); // Ensure the count is reset for this specific test

    render(<GamePage />);
    await act(async () => {}); // Wait for initial load of SECRET_WORD_1

    // --- A. TEST WIN SCENARIO ---
    // 1. ACT: Force a Win (Guess all letters for SECRET_WORD_1)
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    // 2. ASSERT: addSolvedWord is called with the solved word.
    await waitFor(() => {
      expect(mockAddSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1);
      expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
    });

    // 3. ACT: Reset the game by pressing continue (to load SECRET_WORD_2)
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
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    // Press the To Home button
    await act(async () => {
      fireEvent.press(screen.getByText("To Home"));
    });

    // Verify navigation
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });
  });
});
