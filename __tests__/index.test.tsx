import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { mockRouter } from "../__mocks__/expo-router";
import Index from "../app/index";

jest.mock("@/audio/useClickSound", () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock("../components/Cloud", () => "Cloud");
jest.mock("../audio/HeadphoneButton", () => "HeadphoneButton");
jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true],
}));

describe("Home Screen (index.tsx) Navigation and Modals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show the Level modal when the Start Game button is pressed", () => {
    const { getByText, queryByText } = render(<Index />);

    expect(queryByText("Select Level")).toBeNull();

    const startGameButton = getByText("Start Game");
    fireEvent.press(startGameButton);

    expect(getByText("Select Level")).toBeOnTheScreen();
  });

  it("should show/hide the How To Play modal when its button is pressed", () => {
    const { getByText, queryByText } = render(<Index />);
    const howToPlayButton = getByText("How To Play");

    fireEvent.press(howToPlayButton);
    expect(queryByText("Hey, it's")).toBeOnTheScreen();
  });

  it("should navigate to the game screen with the correct level parameter after selection", async () => {
    const { getByText } = render(<Index />);

    fireEvent.press(getByText("Start Game"));

    const easyButton = getByText("EASY");
    fireEvent.press(easyButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "gamePage",
        params: { selectedLevel: "Easy" },
      });
    });
  });
});
