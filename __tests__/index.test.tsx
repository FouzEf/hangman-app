import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
import { act } from "react-test-renderer";
import Index from "../app/index"; // The component under test
import { fetchWordsOnce } from "../utils/CheckLevelCompletion";

// ----------------------------------------------------------------------
// 1. Global Mocks and Trackers
// ----------------------------------------------------------------------
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};

// This is the sound function that the test will track.
const mockPlaySound = jest.fn();

// ----------------------------------------------------------------------
// 2. Mocking Dependencies
// ----------------------------------------------------------------------

// Explicitly mock LinearGradient as a named export.
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
}));

// Mocking expo-router, ensuring Link component is mocked
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  Link: (props: any) =>
    require("react").createElement(
      require("react-native").Text,
      { ...props },
      props.children
    ),
}));

// Mocking the useClickSound hook to return our tracking function
jest.mock("@/audio/useClickSound", () => () => mockPlaySound);

// Mocking fonts
jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true, null],
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
  Nunito_400Regular: "Nunito_400Regular",
}));

// Mock complex native dependencies like expo-vector-icons.
jest.mock("@expo/vector-icons", () => ({
  AntDesign: "AntDesignMock",
}));

// HeadphoneButton is a default export, return the string directly.
jest.mock("../audio/HeadphoneButton", () => "HeadphoneButtonMock");

// Cloud is a default export, return the string directly.
jest.mock("@/components/Cloud", () => "CloudMock");

jest.mock("../utils/CheckLevelCompletion", () => ({
  fetchWordsOnce: jest.fn(),
}));

// Mock HowToPLay as a default export
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

// Mock Level as a default export, including the mockPlaySound call for coverage
jest.mock("@/components/Level", () => {
  const { View, Text } = require("react-native");
  const MockLevel = ({ levelVisible, setLevelValue, setLevelVisible }: any) => {
    if (!levelVisible) return null;
    return (
      <View>
        <Text>Select Level</Text>
        <Text
          onPress={() => {
            mockPlaySound();
            setLevelValue("Easy");
            setLevelVisible(false);
          }}
        >
          Start Game Easy
        </Text>
        <Text
          onPress={() => {
            mockPlaySound();
            setLevelValue("hard");
            setLevelVisible(false);
          }}
        >
          Start Game Hard
        </Text>
      </View>
    );
  };
  return MockLevel;
});

// ----------------------------------------------------------------------
// 3. Test Suite
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

  it("should show and then hide the How to Play modal when the button is pressed twice (toggle)", async () => {
    const { getByText, queryByText } = render(<Index />);

    const howToPlayButton = getByText("How to Play?");

    // Press 1: Show the modal
    fireEvent.press(howToPlayButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(1);
    expect(
      queryByText(/Your favourite all-time classic game\./i)
    ).toBeOnTheScreen();

    // Press 2: Hide the modal
    fireEvent.press(howToPlayButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(
        queryByText(/Your favourite all-time classic game\./i)
      ).not.toBeOnTheScreen();
    });
    expect(howToPlayButton).toBeOnTheScreen();
  });

  it("should navigate to the game screen with the correct level parameter after selecting Easy", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["word1", "word2"]);

    const { getByText, findByText } = render(<Index />);
    // Press 1: Start Game (Sound Call 1)
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Press 2: Start Game Easy
    const easyButton = await findByText("Start Game Easy");

    // 🔥 FIX: Use a single, aggressive await act block to flush promises (fetchWordsOnce)
    // and timers (setTimeout containing router.push) before asserting. This resolves
    // both the `act` warning and the `0 calls` failure.
    await act(async () => {
      fireEvent.press(easyButton);

      // 1. Flush initial promises (fetchWordsOnce).
      await Promise.resolve();

      // 2. Run timers (This executes router.push and schedules a re-render/update).
      jest.runAllTimers();

      // 3. Flush any re-renders/promises triggered by the timers to empty the queue.
      await Promise.resolve();
    });

    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    // Assert the result of the fully completed asynchronous action
    // We expect the navigation to have been called inside the act block.
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "Easy" },
    });

    expect(fetchWordsOnce).toHaveBeenCalledWith("Easy");
  });

  it("should navigate to the game screen with the correct level parameter after selecting Hard", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["wordA", "wordB"]);

    const { getByText, findByText } = render(<Index />);
    // Press 1: Start Game (Sound Call 1)
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Press 2: Start Game Hard
    const hardButton = await findByText("Start Game Hard");

    // 🔥 FIX: Use a single, aggressive await act block to flush promises (fetchWordsOnce)
    // and timers (setTimeout containing router.push) before asserting.
    await act(async () => {
      fireEvent.press(hardButton);

      // 1. Flush initial promises (fetchWordsOnce).
      await Promise.resolve();

      // 2. Run timers (This executes router.push and schedules a re-render/update).
      jest.runAllTimers();

      // 3. Flush any re-renders/promises triggered by the timers to empty the queue.
      await Promise.resolve();
    });

    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    // Assert the result of the fully completed asynchronous action
    // We expect the navigation to have been called inside the act block.
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "hard" },
    });

    expect(fetchWordsOnce).toHaveBeenCalledWith("hard");
  });
});
