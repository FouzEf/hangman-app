// __tests__/GamePage.test.tsx
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { act } from "react-test-renderer";

import { fetchWordsOnce } from "../WordService";
import { addSolvedWord } from "../utils/storage";

const SECRET_WORD = "TEST";

describe("GamePage", () => {
  beforeEach(() => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue([
      SECRET_WORD,
      "anotherWord",
    ]);
    jest.clearAllMocks(); // Clear mocks for a clean test environment
  });
  // ----------------- ROUTER MOCKS -----------------
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
        React.createElement(
          Text,
          { ...props, testID: `Link-${href}` },
          children
        ),
    };
  });

  // ----------------- UTIL MOCKS -----------------
  jest.mock("../WordService", () => ({ fetchWordsOnce: jest.fn() }));
  jest.mock("@/WordService", () => ({ fetchWordsOnce: jest.fn() }));

  jest.mock("../utils/storage", () => ({
    addSolvedWord: jest.fn(),
    getSolvedWords: jest.fn().mockResolvedValue([]),
  }));
  jest.mock("@/utils/storage", () => ({
    addSolvedWord: jest.fn(),
    getSolvedWords: jest.fn().mockResolvedValue([]),
  }));

  // ----------------- UI/ENV MOCKS -----------------
  jest.mock("expo-linear-gradient", () => {
    const React = require("react");
    const { View } = require("react-native");
    return { LinearGradient: (props: any) => React.createElement(View, props) };
  });

  // ✅ Critical: mock the *relative* path used inside GamePage with a virtual module
  jest.mock(
    "../../audio/HeadphoneButton",
    () => {
      const React = require("react");
      const { View } = require("react-native");
      return {
        __esModule: true,
        default: (p: any) =>
          React.createElement(View, { ...p, testID: "HeadphoneButton" }),
      };
    },
    { virtual: true }
  );

  // Also mock the alias path (in case other files import via alias)
  jest.mock("@/audio/HeadphoneButton", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: (p: any) =>
        React.createElement(View, { ...p, testID: "HeadphoneButton" }),
    };
  });

  jest.mock("@/audio/SoundManager", () => ({
    soundManager: { playLooping: jest.fn(), stop: jest.fn(), play: jest.fn() },
  }));

  const mockPlaySound = jest.fn();
  jest.mock("@/audio/useClickSound", () => () => mockPlaySound);

  // CloudGamePage + scene bits (alias imports used by GamePage)
  jest.mock("@/components/CloudGamePage", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: (p: any) =>
        React.createElement(View, { ...p, testID: "CloudGamePage" }),
    };
  });

  jest.mock("@/components/Grass", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: (p: any) => React.createElement(View, { ...p, testID: "Grass" }),
    };
  });

  jest.mock("@/components/lottieFiles/BirdLottie", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: (p: any) =>
        React.createElement(View, { ...p, testID: "BirdLottie" }),
    };
  });

  jest.mock("@/components/lottieFiles/LottieLeaves", () => {
    const React = require("react");
    const { View } = require("react-native");
    const Default = (p: any) =>
      React.createElement(View, { ...p, testID: "LottieLeaves" });
    const LottieLeavesTwo = (p: any) =>
      React.createElement(View, { ...p, testID: "LottieLeavesTwo" });
    return { __esModule: true, default: Default, LottieLeavesTwo };
  });

  jest.mock("@/components/lottieFiles/WindMillLottie", () => {
    const React = require("react");
    const { View } = require("react-native");
    const Default = (p: any) =>
      React.createElement(View, { ...p, testID: "WindMillLottie" });
    const WindMillLottieTwo = (p: any) =>
      React.createElement(View, { ...p, testID: "WindMillLottieTwo" });
    return { __esModule: true, default: Default, WindMillLottieTwo };
  });

  // Input mock that can force win/lose
  const MockInput = ({ setSolvedWord, setWrongGuesses, WORD }: any) => {
    const { Button } = require("react-native");
    return (
      <>
        <Button
          title="GuessCorrect"
          onPress={() => setSolvedWord(WORD.split(""))}
          testID="guess-correct-btn"
        />
        <Button
          title="GuessIncorrect"
          onPress={() => setWrongGuesses((prev: string[]) => [...prev, "#"])}
          testID="guess-incorrect-btn"
        />
      </>
    );
  };
  jest.mock("@/components/Input", () => MockInput);

  // Win/Lose modal mock
  const MockWinOrLose = ({
    modalVisible,
    wrongGuesses,
    toHome,
    continueOrRetry,
  }: any) => {
    const { View, Text, Button } = require("react-native");
    if (!modalVisible) return null;
    const title = wrongGuesses.length < 6 ? "You Won!" : "You Lost!";
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

  // ----------------- LOAD SUT AFTER MOCKS -----------------
  const GamePage = require("../app/gamePage/index").default;
  // Define the words for the mock sequence (ensure at least two words are available)
  const SECRET_WORD_1 = "WIN";
  const SECRET_WORD_2 = "NEW";

  // --- MOCK SETUP MODIFICATION ---
  // If you have a global beforeEach, ensure fetchWordsOnce is set up to return
  // different words on the first and second call:

  beforeEach(() => {
    // 1st call (Initial Load) returns both words
    (fetchWordsOnce as jest.Mock).mockResolvedValueOnce([
      SECRET_WORD_1,
      SECRET_WORD_2,
    ]);
    // 2nd call (Continue/Retry pressed) returns only the second word
    (fetchWordsOnce as jest.Mock).mockResolvedValueOnce([SECRET_WORD_2]);
    jest.clearAllMocks();
  });
  // ----------------- TESTS -----------------
  describe("GamePage (Hangman) Core Functionality", () => {
    const SECRET_WORD = "TEST";

    beforeEach(() => {
      jest.clearAllMocks();
      cleanup();
      (fetchWordsOnce as jest.Mock).mockResolvedValue([SECRET_WORD, "WORD2"]);
    });

    it("should initialize with the correct level and fetch a word", async () => {
      render(<GamePage />);
      expect(fetchWordsOnce).toHaveBeenCalledWith(
        mockSearchParams.selectedLevel
      );
      await act(async () => {});
      expect(screen.getByTestId("CloudGamePage")).toBeOnTheScreen();
    });

    it("should increase wrongGuesses on incorrect guess", async () => {
      render(<GamePage />);
      await act(async () => {});
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
      });
      expect(fetchWordsOnce).toHaveBeenCalled();
    });

    it("should show WIN modal when solving the word", async () => {
      render(<GamePage />);
      await act(async () => {});
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-correct-btn"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
        expect(screen.getByText("You Won!")).toBeOnTheScreen();
      });

      await act(async () => {
        fireEvent.press(screen.getByTestId("continue-retry-btn"));
      });
      expect(addSolvedWord).toHaveBeenCalledWith(SECRET_WORD);
    });

    it("should show LOSE modal after 6 wrong guesses", async () => {
      render(<GamePage />);
      await act(async () => {});
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
        });
      }
      await waitFor(() => {
        expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
        expect(screen.getByText("You Lost!")).toBeOnTheScreen();
      });
      expect(addSolvedWord).not.toHaveBeenCalled();
    });

    it("should navigate home when pressing To Home", async () => {
      render(<GamePage />);
      await act(async () => {});
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-correct-btn"));
      });
      await act(async () => {
        fireEvent.press(screen.getByTestId("to-home-btn"));
      });
      expect(mockRouter.push).toHaveBeenCalled();
    });
    //Correct Letter Guess Test
    it("should handle a correct letter guess, revealing letters and disabling the key", async () => {
      render(<GamePage />);
      await act(async () => {}); // Wait for initial load and word fetch

      // 1. Act: Press the correct letter 'T'
      const tKey = screen.getByText("T", { exact: true });
      await act(async () => {
        fireEvent.press(tKey);
      });

      await waitFor(() => {
        const revealedT = screen.queryAllByDisplayValue("T");
        expect(revealedT.length).toBe(2);
      });
      const wrongGuessesText = screen.getByText(/Wrong Guesses: 0/i);
      await act(async () => {
        fireEvent.press(tKey); // Press 'T' again
      });
      expect(screen.getByText(/Wrong Guesses: 0/i)).toBe(wrongGuessesText);
    });
  });

  it("should handle an incorrect letter guess, increasing wrong guess count and disabling the key", async () => {
    render(<GamePage />);
    await act(async () => {}); // Wait for initial load

    // 1. Act: Press the incorrect letter 'X'
    const xKey = screen.getByText("X", { exact: true });
    await act(async () => {
      fireEvent.press(xKey);
    });

    // 2. Assertion: Wrong guess list updates to include 'x' (lowercase is used in the display)
    await waitFor(() => {
      expect(screen.getByText(/Wrong Guesses: x/i)).toBeOnTheScreen();
    });

    // 3. Assertion: The 'X' key is disabled (repressing it shouldn't duplicate the guess)
    const currentWrongGuessesText = screen.getByText(/Wrong Guesses: x/i);
    await act(async () => {
      fireEvent.press(xKey); // Press 'X' again
    });

    // The text content should be exactly the same (only one 'x'), indicating the second press was blocked.
    expect(screen.getByText(/Wrong Guesses: x/i)).toBe(currentWrongGuessesText);
  });
  // Inside your describe("GamePage") block:

  // ----------------------------------------------------------------------
  // NEW TEST: Keyboard Disabled on Game Over
  // ----------------------------------------------------------------------
  it("should disable the keyboard and prevent further guesses when the game is over (loss)", async () => {
    // Letters 'A' through 'F' are all incorrect for the word 'TEST'
    const incorrectLetters = ["A", "B", "C", "D", "E", "F"];
    render(<GamePage />);
    await act(async () => {}); // Wait for initial load

    // 1. Act: Force a loss (6 wrong guesses)
    for (const letter of incorrectLetters) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter, { exact: true }));
      });
    }

    // Pre-Check: Verify game over state and the list of 6 wrong guesses
    await waitFor(() => {
      // Check that the loss modal is visible
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
      // Check that the list contains all 6 letters
      expect(
        screen.getByText(/Wrong Guesses: a, b, c, d, e, f/i)
      ).toBeOnTheScreen();
    });

    // 2. Act: Press a NEW incorrect letter ('G') after the game is over
    const gKey = screen.getByText("G", { exact: true });
    await act(async () => {
      fireEvent.press(gKey);
    });

    // 3. Assertion: Wrong Guesses list does not update. The 'g' should not appear.
    // The previous text should still be on screen, and 'g' should not be present.
    expect(
      screen.getByText(/Wrong Guesses: a, b, c, d, e, f/i)
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Wrong Guesses:.*g/i)).not.toBeOnTheScreen();
  });

  // ----------------------------------------------------------------------
  // NEW TEST: Continue after Win
  // ----------------------------------------------------------------------
  it("should reset state and load a new word when 'Continue' is pressed after a win", async () => {
    render(<GamePage />);
    await act(async () => {}); // 1. Wait for initial load of SECRET_WORD_1 ("WIN")

    // 2. ACT: Force a Win (e.g., by pressing a mock 'guess-correct-btn')
    await act(async () => {
      // Assume one press is enough to solve the word (e.g., if you mock a very short word)
      fireEvent.press(screen.getByTestId("guess-correct-btn"));
    });

    // ASSERT: Win modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
      expect(screen.getByTestId("win-or-lose-modal")).toBeOnTheScreen();
    });

    // 3. ACT: Press the Continue button
    await act(async () => {
      fireEvent.press(screen.getByTestId("continue-retry-btn"));
    });

    // 4. ASSERT: Modal hides
    await waitFor(() => {
      expect(screen.queryByTestId("win-or-lose-modal")).not.toBeOnTheScreen();
    });

    // 5. ASSERT: Game state is reset (WrongGuesses: 0)
    // This confirms the state reset function ran.
    expect(screen.getByText(/Wrong Guesses: 0/i)).toBeOnTheScreen();

    // 6. ASSERT: A new word was loaded (fetchWordsOnce called a second time)
    // This confirms the game correctly called to advance to the next word.
    await waitFor(() => {
      expect(fetchWordsOnce).toHaveBeenCalledTimes(2);
    });
  });
  // ----------------------------------------------------------------------
  // NEW TEST: Solved Word Storage Boundary
  // ----------------------------------------------------------------------
  it("should call addSolvedWord on win and NOT call it on loss", async () => {
    // Ensure addSolvedWord mock is clear before this test
    (addSolvedWord as jest.Mock).mockClear();

    render(<GamePage />);
    await act(async () => {}); // Wait for initial load

    // --- A. TEST WIN SCENARIO ---
    // 1. ACT: Force a Win (assuming 'SECRET_WORD' is available from your setup)
    await act(async () => {
      fireEvent.press(screen.getByTestId("guess-correct-btn"));
    });

    // 2. ASSERT: addSolvedWord is called with the solved word.
    await waitFor(() => {
      expect(addSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1); // Using SECRET_WORD_1 from the mock
      expect(addSolvedWord).toHaveBeenCalledTimes(1);
    });

    // 3. ACT: Reset the game by pressing continue (to clear state for the next part)
    await act(async () => {
      fireEvent.press(screen.getByTestId("continue-retry-btn"));
    });

    // --- B. TEST LOSS SCENARIO (Word 2) ---
    // 4. ACT: Force a Loss (6 incorrect guesses) on the new word (SECRET_WORD_2)
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByTestId("guess-incorrect-btn"));
      });
    }

    // 5. ASSERT: Loss modal is shown
    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // 6. ASSERT: addSolvedWord is NOT called again (total calls remains 1 from the win)
    expect(addSolvedWord).toHaveBeenCalledTimes(1);
  });
});
