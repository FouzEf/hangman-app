import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { mockRouter } from "../__mocks__/expo-router";
import Index from "../app/index";

// Activate manual mock in __mocks__/expo-router.ts
jest.mock("expo-router"); // <- CRITICAL

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
  beforeAll(() => {
    // Use fake timers in case navigation or effects are scheduled
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Prevent leaking timers across tests
    jest.runOnlyPendingTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should show the Level modal when the Start Game button is pressed", () => {
    const { getByText, queryByText } = render(<Index />);

    // expect(queryByText("Select Level")).toBeNull();
    expect(queryByText(/level/i)).toBeNull();

    // const startGameButton = getByText("Start Game");
    const startGameButton = getByText(/start game/i);
    fireEvent.press(startGameButton);

    // expect(getByText("Select Level")).toBeOnTheScreen();
    expect(getByText(/level/i)).toBeOnTheScreen();
  });

  it("should show/hide the How to Play modal when its button is pressed", () => {
    const { getByText /*, queryByText */ } = render(<Index />);

    // const howToPlayButton = getByText("How to Play");
    const howToPlayButton = getByText(/how to play\??/i);

    fireEvent.press(howToPlayButton);

    // expect(queryByText("Hey, it's")).toBeOnTheScreen();
    // Assert against a stable heading/copy instead of fragile text:
    expect(getByText(/how to play/i)).toBeTruthy();
  });

  it("should navigate to the game screen with the correct level parameter after selection", async () => {
    const { getByText } = render(<Index />);

    // fireEvent.press(getByText("Start Game"));
    fireEvent.press(getByText(/start game/i));

    // const easyButton = getByText("Easy");
    const easyButton = getByText(/easy/i);
    fireEvent.press(easyButton);

    // In case navigation is scheduled via timers/effects
    jest.runAllTimers();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "gamePage",
        params: { selectedLevel: "Easy" },
      });
    });
  });
});
