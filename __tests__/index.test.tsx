// __tests__/index.test.tsx
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import Index from "../app/index"; // Component under test
import { fetchWordsOnce } from "../utils/CheckLevelCompletion";

// ----------------------------------------------------------------------
// 1) Shared router mock (must be created before the component uses it)
// ----------------------------------------------------------------------
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSetParams = jest.fn();

// Mock expo-linear-gradient first (simple named export)
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
}));

// Mock expo-router with a stable, shared push reference
jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      setParams: mockSetParams,
    }),
    Link: (props: any) =>
      React.createElement(Text, { ...props }, props.children),
  };
});

// ----------------------------------------------------------------------
// 2) Other dependency mocks
// ----------------------------------------------------------------------
const mockPlaySound = jest.fn();

jest.mock("@/audio/useClickSound", () => () => mockPlaySound);

jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true, null],
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
  Nunito_400Regular: "Nunito_400Regular",
}));

jest.mock("@expo/vector-icons", () => ({
  AntDesign: "AntDesignMock",
}));

jest.mock("../audio/HeadphoneButton", () => "HeadphoneButtonMock");
jest.mock("@/components/Cloud", () => "CloudMock");

// We will assert on calls to this function
jest.mock("../utils/CheckLevelCompletion", () => ({
  fetchWordsOnce: jest.fn(),
}));

// HowToPlay mock (only visible when modalVisible=true)
jest.mock("@/components/HowToPLay", () => {
  const { View, Text } = require("react-native");
  const MockHowToPlay = ({ modalVisible, onClose }: any) => {
    if (!modalVisible) return null;
    return (
      <View>
        <Text testID="HowToPlay-Mock">
          Your favourite all-time classic game.
        </Text>
        <Text onPress={onClose}>Close Button</Text>
      </View>
    );
  };
  return MockHowToPlay;
});

// Level mock that mirrors real behavior:
// - plays click sound
// - sets level value and hides modal
// - calls fetchWordsOnce(level)
// - navigates with router.push after a 0ms timer (so tests must flush timers)
jest.mock("@/components/Level", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const { useRouter } = require("expo-router");
  const { fetchWordsOnce } = require("../utils/CheckLevelCompletion");
  const mock = ({ levelVisible, setLevelValue, setLevelVisible }: any) => {
    if (!levelVisible) return null;
    const router = useRouter();

    const choose = async (level: "Easy" | "hard") => {
      // sound click
      require("@/audio/useClickSound")()();
      setLevelValue(level);
      setLevelVisible(false);

      await fetchWordsOnce(level);

      setTimeout(() => {
        router.push({
          pathname: "/gamePage",
          params: { selectedLevel: level },
        });
      }, 0);
    };

    return (
      <View>
        <Text>Select Level</Text>
        <Text onPress={() => choose("Easy")}>Start Game Easy</Text>
        <Text onPress={() => choose("hard")}>Start Game Hard</Text>
      </View>
    );
  };
  return mock;
});

// ----------------------------------------------------------------------
// 3) Utilities for flushing timers & microtasks deterministically
// ----------------------------------------------------------------------
async function flushAll() {
  // 1) Let any pending promises (e.g., fetchWordsOnce) resolve so the code
  //    after 'await fetchWordsOnce' can schedule the setTimeout(...).
  await act(async () => {
    await Promise.resolve();
  });

  // 2) Now run the scheduled timers (this should invoke router.push).
  await act(async () => {
    jest.runAllTimers();
  });

  // 3) Finally, flush any microtasks queued by the timer handlers.
  await act(async () => {
    await Promise.resolve();
  });
}

// ----------------------------------------------------------------------
// 4) Tests
// ----------------------------------------------------------------------
describe("Home Screen (index.tsx) Navigation and Modals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it("shows then hides How to Play modal when toggled", async () => {
    const { getByText, queryByText } = render(<Index />);

    const howToPlayButton = getByText("How to Play?");

    // Show modal
    fireEvent.press(howToPlayButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(1);
    expect(
      queryByText(/Your favourite all-time classic game\./i)
    ).toBeOnTheScreen();

    // Hide modal
    fireEvent.press(howToPlayButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(
        queryByText(/Your favourite all-time classic game\./i)
      ).not.toBeOnTheScreen();
    });
    expect(howToPlayButton).toBeOnTheScreen();
  });

  it("navigates with correct param after selecting Easy", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["word1", "word2"]);

    const { getByText, findByText } = render(<Index />);

    // Open the level modal
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Choose Easy
    const easyButton = await findByText("Start Game Easy");
    fireEvent.press(easyButton);

    // Flush the async flow (awaited fetch + 0ms navigation timer)
    await flushAll();

    expect(mockPlaySound).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "Easy" },
    });
    expect(fetchWordsOnce).toHaveBeenCalledWith("Easy");
  });

  it("navigates with correct param after selecting Hard", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["wordA", "wordB"]);

    const { getByText, findByText } = render(<Index />);

    // Open the level modal
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Choose Hard
    const hardButton = await findByText("Start Game Hard");
    fireEvent.press(hardButton);

    // Flush the async flow (awaited fetch + 0ms navigation timer)
    await flushAll();

    expect(mockPlaySound).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "hard" },
    });
    expect(fetchWordsOnce).toHaveBeenCalledWith("hard");
  });
});
