import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
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

// 🔥 CRITICAL FIX: Explicitly mock LinearGradient as a named export.
// This local mock ensures the component is defined before Index.tsx imports it.
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
}));

// Mocking expo-router
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  // ✅ FIX: Provide a mock for the Link component to prevent "invalid element" errors.
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

// Mocking internal components/utilities
jest.mock("../audio/HeadphoneButton", () => "HeadphoneButton");

jest.mock("../utils/CheckLevelCompletion", () => ({
  fetchWordsOnce: jest.fn(),
}));

jest.mock("@/components/Cloud", () => "Cloud");

// Mocking HowToPLay component
jest.mock("@/components/HowToPLay", () => {
  const React = require("react");
  // ✅ FIX: Export as a named component to match its usage in the app.
  return {
    HowToPLay: ({ modalVisible, onClose }: any) => {
      if (!modalVisible) return null;
      return (
        <React.Fragment>
          {/* Render text content for querying */}
          <React.Text testID="HowToPlay-Mock">
            Your favourite all-time classic game.
          </React.Text>
          <React.Text onPress={onClose}>Close Button</React.Text>
        </React.Fragment>
      );
    },
  };
});

// Mocking Level component
jest.mock("@/components/Level", () => {
  const React = require("react");
  // ✅ FIX: Export as a named component to match its usage in the app.
  return {
    Level: ({ levelVisible, setLevelValue, setLevelVisible }: any) => {
      if (!levelVisible) return null;
      return (
        <React.Fragment>
          <React.Text>Select Level</React.Text>
          <React.Text
            onPress={() => {
              setLevelValue("Easy");
              setLevelVisible(false);
            }}
          >
            Start Game Easy
          </React.Text>
          <React.Text
            onPress={() => {
              setLevelValue("hard");
              setLevelVisible(false);
            }}
          >
            Start Game Hard
          </React.Text>
        </React.Fragment>
      );
    },
  };
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

    // Press 2: Start Game Easy (Sound Call 2 - from the real Level component)
    const easyButton = await findByText("Start Game Easy");
    fireEvent.press(easyButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    jest.runAllTimers();
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/gamePage",
        params: { selectedLevel: "Easy" },
      });
    });

    expect(fetchWordsOnce).toHaveBeenCalledWith("Easy");
  });

  it("should navigate to the game screen with the correct level parameter after selecting Hard", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["wordA", "wordB"]);

    const { getByText, findByText } = render(<Index />);
    // Press 1: Start Game (Sound Call 1)
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Press 2: Start Game Hard (Sound Call 2 - from the real Level component)
    const hardButton = await findByText("Start Game Hard");
    fireEvent.press(hardButton);
    expect(mockPlaySound).toHaveBeenCalledTimes(2);

    jest.runAllTimers();
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/gamePage",
        params: { selectedLevel: "hard" },
      });
    });

    expect(fetchWordsOnce).toHaveBeenCalledWith("hard");
  });
});
