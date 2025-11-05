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
      React.createElement(Text, { ...props, testID: `Link-${href}` }, children),
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
    expect(fetchWordsOnce).toHaveBeenCalledWith(mockSearchParams.selectedLevel);
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
});
