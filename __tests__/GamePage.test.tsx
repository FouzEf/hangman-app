import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react"; // Explicitly import React for JSX fragments
import { act } from "react-test-renderer";
// Assuming your component is located at '../app/gamePage'
import GamePage from "../app/gamePage/index";

// --- MOCK UTILITIES ---
// NOTE: Please ensure these paths are correct for your project structure
import { fetchWordsOnce } from "../WordService";
import { addSolvedWord } from "../utils/storage";

// ----------------------------------------------------------------------
// 1. MOCKING DEPENDENCIES
// ----------------------------------------------------------------------

// Mock Expo Router to control navigation parameters and actions
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};
// Use a fixed level for tests that don't override it
const mockSearchParams = { selectedLevel: "Easy" };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockSearchParams,
  Link: ({ children, href, ...props }: any) =>
    require("react").createElement(
      require("react-native").Text,
      { ...props, testID: `Link-${href}` },
      children
    ),
}));

// Mock Utility Functions
jest.mock("../WordService", () => ({
  fetchWordsOnce: jest.fn(),
}));
jest.mock("../utils/storage", () => ({
  addSolvedWord: jest.fn(),
  getSolvedWords: jest.fn().mockResolvedValue([]), // Assume no words solved initially
}));

// Mock Sound Hook
const mockPlaySound = jest.fn();
jest.mock("@/audio/useClickSound", () => () => mockPlaySound);

// Mock Child Components
jest.mock("@/components/Grass", () => "GrassMock");
jest.mock("@/audio/HeadphoneButton", () => "HeadphoneButtonMock");
jest.mock("@/components/CloudGamePage", () => "CloudGamePageMock");
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
}));

// MOCK INPUT COMPONENT (FIXED SYNTAX)
const MockInput = ({
  setSolvedWord,
  setWrongGuesses,
  letters,
  solvedWord,
  WORD,
  ...props
}: any) => {
  // 💡 FIX: Destructure required components before use in JSX
  const { Button } = require("react-native");

  const handleCorrectGuess = () => {
    // Find the index of the first not guessed letter in the word (e.g., 'H' in 'HANGMAN')
    const firstUnsolvedLetter = WORD.split("").find(
      (l: string) => !letters.includes(l)
    );
    if (firstUnsolvedLetter) {
      setSolvedWord(WORD.toUpperCase()); // Simulating a win by solving the word
    }
  };
  const handleIncorrectGuess = () => {
    setWrongGuesses((prev: number) => prev + 1);
  };

  return (
    <React.Fragment>
      <Button
        title="GuessCorrect"
        onPress={handleCorrectGuess}
        testID="guess-correct-btn"
      />
      <Button
        title="GuessIncorrect"
        onPress={handleIncorrectGuess}
        testID="guess-incorrect-btn"
      />
    </React.Fragment>
  );
};
jest.mock("@/components/Input", () => MockInput);

// MOCK WIN OR LOSE MODAL (FIXED SYNTAX)
const MockWinOrLose = ({
  modalVisible,
  wrongGuesses,
  toHome,
  continueOrRetry,
}: any) => {
  // 💡 FIX: Destructure required components before use in JSX
  const { View, Text, Button } = require("react-native");

  if (!modalVisible) return null;

  const isWin = wrongGuesses < 6;
  const title = isWin ? "You Won!" : "You Lost!";

  return (
    <View testID="win-or-lose-modal">
      <Text>{title}</Text>
      <Button title="To Home" onPress={toHome} testID="to-home-btn" />
      <Button
        title="Continue/Retry"
        onPress={continueOrRetry}
        testID="continue-retry-btn"
      />
    </View>
  );
};
jest.mock("@/components/WinOrLose", () => MockWinOrLose);

// ----------------------------------------------------------------------
// 2. TEST SUITE
// ----------------------------------------------------------------------

describe("GamePage (Hangman) Core Functionality", () => {
  const SECRET_WORD = "TEST";

  beforeEach(() => {
    jest.clearAllMocks();
    // 💡 Mocking the word list to return a predictable word
    (fetchWordsOnce as jest.Mock).mockResolvedValue([SECRET_WORD, "WORD2"]);
    cleanup();
  });

  // --- 2.1. Initial State and Setup Tests ---
  it("should initialize with the correct level and fetch a word", async () => {
    render(<GamePage />);

    // 1. Verify utility calls
    expect(fetchWordsOnce).toHaveBeenCalledWith(mockSearchParams.selectedLevel);

    // 2. Wait for the initial asynchronous setup (word fetch) to complete
    await act(async () => {});

    // 3. Verify the main components are rendered after load (assuming a successful render shows them)
    // NOTE: If your GamePage uses an id, this is a safer check. Using Text is also common.
    expect(screen.getByTestId("game-page-container")).toBeOnTheScreen();
  });

  // --- 2.2. Core Game Logic Tests ---
  it("should increase wrongGuesses on incorrect letter guess", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Initial check (wrongGuesses starts at 0)
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();

    // Simulate an incorrect guess
    await act(async () => {
      fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
    });

    // Check penalty applied (WrongGuesses: 1)
    expect(screen.getByText(/Wrong Guesses: 1/i)).toBeOnTheScreen();
  });

  // --- 2.3. Win/Loss Condition Tests ---
  it("should show the WIN modal upon successfully solving the word", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Simulate a successful guess (using the mock input to force a win)
    await act(async () => {
      fireEvent.press(screen.getByTestId("guess-correct-btn"));
    });

    // 1. Verify Win modal is visible
    await waitFor(() => {
      expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    // 2. Verify addSolvedWord is called (Crucial for user progress tracking)
    expect(addSolvedWord).toHaveBeenCalledWith(SECRET_WORD);
  });

  it("should show the LOSE modal when MAX_ERRORS (6) is reached", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Simulate 6 incorrect guesses
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
      });
    }

    // 1. Verify Lose modal is visible
    await waitFor(() => {
      expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // 2. Verify addSolvedWord is NOT called on a loss
    expect(addSolvedWord).not.toHaveBeenCalled();
  });

  // --- 2.4. Modal Interaction and Navigation Tests ---
  it("should reset the game state when 'Continue/Retry' is pressed", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Force a loss to open the modal
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
      });
    }

    // Press the Continue/Retry button
    await act(async () => {
      fireEvent.press(screen.getByTestId("continue-retry-btn"));
    });

    // 1. Verify the modal is hidden
    await waitFor(() => {
      expect(screen.queryByTestId("win-or-lose-modal")).not.toBeOnTheScreen();
    });

    // 2. Verify the game state has visually reset (WrongGuesses: 0)
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();

    // 3. Verify a new word was attempted to be fetched
    // This is confirmed if fetchWordsOnce was called twice (initial load + reset)
    expect(fetchWordsOnce).toHaveBeenCalledTimes(2);
  });

  it("should navigate to home screen when 'To Home' is pressed", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for load

    // Force the modal to appear (e.g., force a win)
    await act(async () => {
      fireEvent.press(screen.getByTestId("guess-correct-btn"));
    });

    // Press the To Home button
    await act(async () => {
      fireEvent.press(screen.getByTestId("to-home-btn"));
    });

    // 1. Verify navigation to the home page (using router.replace for a clean exit)
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });
});
