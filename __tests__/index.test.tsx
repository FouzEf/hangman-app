// __tests__/index.test.tsx

// --- Hard-pin RN iOS internals for THIS spec (before any imports) ---
const IOS_CONST = () => ({
  forceTouchAvailable: false,
  interfaceIdiom: "phone",
  osVersion: "14.0",
  systemName: "iOS",
});

jest.mock(
  "react-native/Libraries/Utilities/NativePlatformConstantsIOS",
  () => ({ __esModule: true, default: { getConstants: IOS_CONST } }),
  { virtual: true }
);
jest.mock(
  "react-native/Libraries/Utilities/NativePlatformConstantsIOS.ios.js",
  () => ({ __esModule: true, default: { getConstants: IOS_CONST } }),
  { virtual: true }
);

// Some RN paths read Platform.ios (w/ and w/o .js)
const PLATFORM_IOS = {
  OS: "ios",
  select: (o: any) => (o ? (o.ios ?? o.default) : undefined),
  constants: {}, // AnimatedExports checks this path
  isDisableAnimations: () => true,
};
jest.mock(
  "react-native/Libraries/Utilities/Platform.ios",
  () => ({ __esModule: true, default: PLATFORM_IOS }),
  { virtual: true }
);
jest.mock(
  "react-native/Libraries/Utilities/Platform.ios.js",
  () => ({ __esModule: true, default: PLATFORM_IOS }),
  { virtual: true }
);

// Belt-and-suspenders: AnimatedExports sometimes introspects Platform.*
// Keep animations disabled to avoid native branches.
jest.mock(
  "react-native/Libraries/Animated/AnimatedExports",
  () => ({ __esModule: true, isDisableAnimations: () => true }),
  { virtual: true }
);

// --- Mocks that must be defined before imports ---

// 1) expo-router: expose a router object we can assert on
jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const push = jest.fn();
  const replace = jest.fn();
  const setParams = jest.fn();
  const router = { push, replace, setParams, navigate: push, back: jest.fn() };

  const Passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("RouterStub", null, children);

  return {
    __esModule: true,
    useRouter: () => router,
    router, // importable for assertions
    Link: (props: any) =>
      React.createElement(Text, { ...props }, props.children),
    Stack: Passthrough,
    Slot: Passthrough,
  };
});

// 2) expo-linear-gradient: simple passthrough
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    __esModule: true,
    LinearGradient: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("LinearGradientStub", null, children),
  };
});

// 3) Other dependency mocks
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
jest.mock("../WordService", () => ({
  fetchWordsOnce: jest.fn(),
}));

// HowToPlay mock (only visible when modalVisible=true)
jest.mock("@/components/HowToPLay", () => {
  const React = require("react");
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

// Level mock that mirrors real behavior: click -> set state -> await fetch -> timer -> router.push
jest.mock("@/components/Level", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const { useRouter } = require("expo-router");
  const { fetchWordsOnce } = require("../WordService");

  const MockLevel = ({ levelVisible, setLevelValue, setLevelVisible }: any) => {
    if (!levelVisible) return null;
    const router = useRouter();

    const choose = async (level: "Easy" | "hard") => {
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

  return MockLevel;
});

// ---- Imports (after mocks) ----
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import Index from "../app/index";
import { fetchWordsOnce } from "../WordService";

// ---- Test utilities ----
async function flushAll() {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    jest.runAllTimers();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

class TestErrorBoundary extends React.Component<
  { onError: (e: unknown) => void; children?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.hasError ? null : (this.props.children ?? null);
  }
}

// ---- Tests ----
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
    let captured: unknown;
    const onError = (e: unknown) => {
      captured = e;
      try {
        // @ts-ignore
        console.error("CAPTURED INDEX ERROR:", (e as any)?.message || e);
      } catch {
        console.error("CAPTURED INDEX ERROR:", e);
      }
    };

    const tree = render(
      <TestErrorBoundary onError={onError}>
        <Index />
      </TestErrorBoundary>
    );

    if (captured) throw captured;

    const { getByText, queryByText } = tree;

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

    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    const easyButton = await findByText("Start Game Easy");
    fireEvent.press(easyButton);

    await flushAll();

    expect(mockPlaySound).toHaveBeenCalledTimes(2);
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "Easy" },
    });
    expect(fetchWordsOnce).toHaveBeenCalledWith("Easy");
  });

  it("navigates with correct param after selecting Hard", async () => {
    (fetchWordsOnce as jest.Mock).mockResolvedValue(["wordA", "wordB"]);

    const { getByText, findByText } = render(<Index />);

    fireEvent.press(getByText("Start Game"));
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    const hardButton = await findByText("Start Game Hard");
    fireEvent.press(hardButton);

    await flushAll();

    expect(mockPlaySound).toHaveBeenCalledTimes(2);
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/gamePage",
      params: { selectedLevel: "hard" },
    });
    expect(fetchWordsOnce).toHaveBeenCalledWith("hard");
  });
});
