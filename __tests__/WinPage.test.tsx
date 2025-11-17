import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

// ----------------- ROUTER MOCKS -----------------
const mockRouter = { push: jest.fn(), replace: jest.fn() };
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

// ----------------- FONTS / UI / ENV MOCKS -----------------
jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true],
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
}));

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { LinearGradient: (props: any) => React.createElement(View, props) };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Ionicons: (p: any) =>
      React.createElement(View, { ...p, testID: "Ionicon" }),
  };
});

jest.mock("@react-navigation/native", () => ({
  // run the focus effect immediately on mount
  useFocusEffect: (cb: any) => {
    const cleanup = cb();
    return typeof cleanup === "function" ? cleanup : undefined;
  },
}));

// ----------------- APP-SPECIFIC MOCKS -----------------
jest.mock("@/audio/SoundManager", () => ({
  soundManager: {
    playLooping: jest.fn(),
    stopAll: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockPlayClick = jest.fn();
jest.mock("@/audio/useClickSound", () => () => mockPlayClick);

jest.mock("@/components/lottieFiles/WinLottie", () => {
  const React = require("react");
  const { View } = require("react-native");
  const WinLottie = (p: any) =>
    React.createElement(View, { ...p, testID: "WinLottie" });
  const WinCup = (p: any) =>
    React.createElement(View, { ...p, testID: "WinCup" });
  return { __esModule: true, default: WinLottie, WinCup };
});

// IMPORTANT: mock the exact path WinPage uses for HeadphoneButton
jest.mock(
  "../app/audio/HeadphoneButton",
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
jest.mock("@/audio/HeadphoneButton", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (p: any) =>
      React.createElement(View, { ...p, testID: "HeadphoneButton" }),
  };
});

// Data sources used by the screen
jest.mock("@/utils/storage", () => ({
  getSolvedWords: jest.fn().mockResolvedValue(["APPLE", "X"]),
}));

// Word service (both relative-from-test and alias)
jest.mock("../WordService", () => ({
  fetchWordsOnce: jest.fn().mockResolvedValue(["APPLE", "BANANA"]),
}));
jest.mock("@/WordService", () => ({
  fetchWordsOnce: jest.fn().mockResolvedValue(["APPLE", "BANANA"]),
}));

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

// Toast default + .show
const mockToastShow = jest.fn();
jest.mock("react-native-toast-message", () => {
  const Toast = () => null;
  (Toast as any).show = (...args: any[]) => mockToastShow(...args);
  return { __esModule: true, default: Toast };
});

// ----------------- LOAD SUT AFTER MOCKS -----------------
const WinPage = require("../app/winPage/index").default;

describe("WinPage / index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("plays win loop on focus and renders congrats for the selected level", () => {
    render(<WinPage />);
    expect(screen.getByText("CONGRATULATIONS!")).toBeOnTheScreen();
    expect(screen.getByText(/mastered the/i)).toBeOnTheScreen();
    expect(
      require("@/audio/SoundManager").soundManager.playLooping
    ).toHaveBeenCalledWith("winPage");
  });

  it("navigates home immediately when pressing 'Go Home' and stops all sounds", async () => {
    render(<WinPage />);
    fireEvent.press(screen.getByText("Go Home"));
    expect(mockPlayClick).toHaveBeenCalled();
    // stopAll is awaited inside the handler; give it time to resolve before asserting push
    await waitFor(() =>
      expect(
        require("@/audio/SoundManager").soundManager.stopAll
      ).toHaveBeenCalled()
    );
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/"));
  });

  it("restarts level: filters solved words, writes remainder, shows toast, then navigates after 2s", async () => {
    render(<WinPage />);
    fireEvent.press(screen.getByText("Restart Level"));

    // click + stopAll
    expect(mockPlayClick).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        require("@/audio/SoundManager").soundManager.stopAll
      ).toHaveBeenCalled()
    );

    // fetch + solved
    const { fetchWordsOnce } = require("../WordService");
    const { getSolvedWords } = require("@/utils/storage");
    expect(fetchWordsOnce).toHaveBeenCalledWith("Easy");
    await waitFor(() => expect(getSolvedWords).toHaveBeenCalled());

    // AsyncStorage write: remaining solved = ["X"]
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "solved_words",
        JSON.stringify(["X"])
      )
    );

    // toast
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: expect.stringContaining("Easy"),
        visibilityTime: 2000,
      })
    );

    // navigate after 2s
    jest.advanceTimersByTime(2000);
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});
