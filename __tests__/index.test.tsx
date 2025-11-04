import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
import Index from "../app/index"; // The component under test
import { fetchWordsOnce } from "../utils/CheckLevelCompletion";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

const mockPlaySound = jest.fn();
jest.mock("@/audio/useClickSound", () => () => mockPlaySound);

jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true, null],
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
  Nunito_400Regular: "Nunito_400Regular",
}));

jest.mock("../audio/HeadphoneButton", () => "HeadphoneButton");

jest.mock("../utils/CheckLevelCompletion", () => ({
  fetchWordsOnce: jest.fn(),
}));

jest.mock("@/components/Cloud", () => "Cloud");

jest.mock("@/components/HowToPLay", () => {
  const React = require("react");
  const { Modal, Text, View } = require("react-native");
  return ({ modalVisible, onClose }: any) => {
    if (!modalVisible) return null;
    return (
      <Modal visible={modalVisible} transparent>
        <View>
          <Text>How to Play?</Text>
          <Text>How to play:</Text>
          <Text>Your favourite all-time classic game.</Text>
          <Text onPress={onClose}>Close</Text>
        </View>
      </Modal>
    );
  };
});

jest.mock("@/components/Level", () => {
  const React = require("react");
  const { Text, Pressable, View } = require("react-native");

  const mockedFetchWordsOnce =
    require("../utils/CheckLevelCompletion").fetchWordsOnce;

  return ({ setLevelVisible, setLevelValue, levelVisible }: any) => {
    if (!levelVisible) return null;
    const handleLevel = async (level: string) => {
      mockPlaySound();
      setLevelValue(level);
      setLevelVisible(false);
      await mockedFetchWordsOnce(level);
      mockRouter.push({
        pathname: "/gamePage",
        params: { selectedLevel: level },
      });
    };

    return (
      <View testID="level-modal">
        <Pressable onPress={() => handleLevel("Easy")}>
          <Text>Start Game Easy</Text>
        </Pressable>
        <Pressable onPress={() => handleLevel("hard")}>
          <Text>Start Game Hard</Text>
        </Pressable>
      </View>
    );
  };
});

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
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

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
    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

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
