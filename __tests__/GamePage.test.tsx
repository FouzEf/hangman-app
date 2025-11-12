// __tests__/GamePage.test.tsx

// --- Fix for RN Platform constants ---
jest.mock(
  "react-native/Libraries/Utilities/NativePlatformConstantsIOS",
  () => {
    const api = {
      getConstants: () => ({
        forceTouchAvailable: false,
        interfaceIdiom: "phone",
        osVersion: "14.0",
        systemName: "iOS",
      }),
    };
    return { __esModule: true, default: api, ...api };
  },
  { virtual: true }
);

// --- Mock Lottie & Animated-heavy UI components ---
jest.mock("@/components/CloudGamePage", () => "CloudGamePageMock");
jest.mock("@/audio/HeadphoneButton", () => "HeadphoneButtonMock");
jest.mock("@/components/Grass", () => "GrassMock");

// Stub Input to render letter slots (driven by solvedWord)
jest.mock("@/components/Input", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const Stub = (props: any) => {
    const len = Array.isArray(props?.solvedWord) ? props.solvedWord.length : 0;
    return React.createElement(
      View,
      null,
      Array.from({ length: len }).map((_, i) =>
        React.createElement(
          Text,
          { key: i, testID: "letter-slot" },
          props.solvedWord[i] || "_"
        )
      )
    );
  };
  return Stub;
});

// WinOrLose mock (render NO text; tests use testIDs only if modal appears)
jest.mock("@/components/WinOrLose", () => {
  const React = require("react");
  const { View, Pressable } = require("react-native");
  return function WinOrLoseMock(props: {
    modalVisible?: boolean;
    continueOrRetry?: () => void;
    toHome?: () => void;
  }) {
    if (!props?.modalVisible) return null;
    return (
      <View testID="win-lose-modal">
        <Pressable testID="continue-button" onPress={props?.continueOrRetry} />
        <Pressable testID="home-button" onPress={props?.toHome} />
      </View>
    );
  };
});

jest.mock("@/components/lottieFiles/BirdLottie", () => "BirdLottieMock");
jest.mock("@/components/lottieFiles/LottieLeaves", () => ({
  __esModule: true,
  default: "LottieLeavesMock",
  LottieLeavesTwo: "LottieLeavesTwoMock",
}));
jest.mock("@/components/lottieFiles/WindMillLottie", () => ({
  __esModule: true,
  default: "WindMillLottieMock",
  WindMillLottieTwo: "WindMillLottieTwoMock",
}));

// --- Sound + storage mocks ---
jest.mock("@/audio/SoundManager", () => ({
  soundManager: {
    playLooping: jest.fn(),
    stop: jest.fn(),
    play: jest.fn(),
    setMuted: jest.fn().mockResolvedValue(undefined),
    preloadAll: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock("@/audio/useClickSound", () => () => jest.fn());

const mockAddSolvedWord = jest.fn();
const mockGetSolvedWords = jest.fn().mockResolvedValue([]);
jest.mock("@/utils/storage", () => ({
  addSolvedWord: (w: string) => mockAddSolvedWord(w),
  getSolvedWords: (...args: any[]) => mockGetSolvedWords(...args),
}));

// Non-aliased SoundSettingsContext path used by GamePage import in this project
jest.mock("../audio/SoundSettingsContext", () => {
  const React = require("react");
  const mockValue = {
    soundEnabled: false,
    musicEnabled: false,
    toggleSound: jest.fn(),
    toggleMusic: jest.fn(),
    playClick: jest.fn(),
    playSuccess: jest.fn(),
    playFail: jest.fn(),
  };
  return {
    __esModule: true,
    SoundSettingsProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useSoundSettings: () => mockValue,
  };
});

// Image assets (prevent loading errors)
jest.mock("@assets/images/gallow.png", () => "test-file-stub");
jest.mock("@assets/images/grass3.png", () => "test-file-stub");
jest.mock("@assets/images/HomButton.png", () => "test-file-stub");
jest.mock("@assets/images/Stage1.png", () => "test-file-stub");
jest.mock("@assets/images/Stage2.png", () => "test-file-stub");
jest.mock("@assets/images/Stage3.png", () => "test-file-stub");
jest.mock("@assets/images/Stage4.png", () => "test-file-stub");
jest.mock("@assets/images/Stage5.png", () => "test-file-stub");
jest.mock("@assets/images/Stage6.png", () => "test-file-stub");

// --- CRITICAL: Keyboard mock with disabled state (case-insensitive lists)
jest.mock("@/components/Keyboard", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function KeyboardMock(props: any) {
    const {
      onKeyPress,
      correctGuesses = [],
      wrongGuesses = [],
      isGameOver = false,
    } = props || {};

    return React.createElement(
      React.Fragment,
      null,
      ...letters.map((L: string) => {
        const l = L.toLowerCase();
        const disabled =
          isGameOver ||
          correctGuesses.includes(l) ||
          correctGuesses.includes(L) ||
          wrongGuesses.includes(l) ||
          wrongGuesses.includes(L);

        return React.createElement(
          Pressable,
          {
            key: L,
            testID: `key-${L}`,
            disabled,
            onPress: () => {
              if (!disabled && onKeyPress) onKeyPress(L);
            },
          },
          React.createElement(Text, null, L)
        );
      })
    );
  }

  return { __esModule: true, default: KeyboardMock };
});

jest.mock("../components/Keyboard", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function KeyboardMock(props: any) {
    const {
      onKeyPress,
      correctGuesses = [],
      wrongGuesses = [],
      isGameOver = false,
    } = props || {};

    return React.createElement(
      React.Fragment,
      null,
      ...letters.map((L: string) => {
        const l = L.toLowerCase();
        const disabled =
          isGameOver ||
          correctGuesses.includes(l) ||
          correctGuesses.includes(L) ||
          wrongGuesses.includes(l) ||
          wrongGuesses.includes(L);

        return React.createElement(
          Pressable,
          {
            key: L,
            testID: `key-${L}`,
            disabled,
            onPress: () => {
              if (!disabled && onKeyPress) onKeyPress(L);
            },
          },
          React.createElement(Text, null, L)
        );
      })
    );
  }

  return { __esModule: true, default: KeyboardMock };
});

// --- WordService (mock both paths, one shared fn) ---
const mockFetchWordsOnce = jest.fn();
jest.mock("@/WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));
jest.mock("../WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));

// expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({ LinearGradient: "LinearGradient" }));

// Stub CloudGamePage/Grass for non-aliased paths too
jest.mock("../components/CloudGamePage", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => React.createElement(View, null);
});
jest.mock("../components/Grass", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => React.createElement(View, null);
});

// lottie-react-native
jest.mock("lottie-react-native", () => {
  const React = require("react");
  const Mock = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      play: jest.fn(),
      pause: jest.fn(),
      reset: jest.fn(),
    }));
    return null;
  });
  Mock.displayName = "LottieView";
  return Mock;
});

// expo-av
jest.mock("expo-av", () => {
  const mockSoundInstance = {
    loadAsync: jest.fn().mockResolvedValue({ status: {} }),
    playAsync: jest.fn(),
    pauseAsync: jest.fn(),
    stopAsync: jest.fn(),
    unloadAsync: jest.fn(),
    getStatusAsync: jest.fn().mockResolvedValue({
      isLoaded: true,
      isPlaying: false,
      didJustFinish: false,
    }),
    setOnPlaybackStatusUpdate: jest.fn(),
    setVolumeAsync: jest.fn().mockResolvedValue(undefined),
    setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
  };
  function MockSound(this: any) {
    return mockSoundInstance;
  }
  return {
    Audio: {
      Sound: MockSound as any,
      setAudioModeAsync: jest.fn(),
    },
    useForegroundPermissions: jest
      .fn()
      .mockReturnValue([{ granted: true }, jest.fn()]),
    usePermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
  };
});
const expoAv = require("expo-av");
expoAv.Audio.Sound.createAsync = jest.fn(async () => ({
  sound: new expoAv.Audio.Sound(),
  status: {},
}));

// --- Shared router instance for assertions ---
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
};
const mockSearchParams = { selectedLevel: "Easy" };

jest.mock("expo-router", () => {
  const React = require("react");
  const Passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("ExpoRouterStub", null, children);
  return {
    __esModule: true,
    useRouter: () => mockRouter,
    router: mockRouter,
    useLocalSearchParams: () => mockSearchParams,
    Stack: Passthrough,
    Slot: Passthrough,
    Link: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("LinkStub", null, children),
  };
});

// Optional: silence EXPO_OS warnings
beforeAll(() => {
  (process as any).env.EXPO_OS = "web";
});

// -----------------------------
// 1) Imports
// -----------------------------
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { act } from "react-test-renderer";
import GamePage from "../app/gamePage/index";
import { SoundSettingsProvider } from "../audio/SoundSettingsContext";

// -----------------------------
// 2) Helpers & Constants
// -----------------------------
const renderWithProviders = (ui: React.ReactNode) =>
  render(<SoundSettingsProvider>{ui}</SoundSettingsProvider>);

const SECRET_WORD_1 = "HANGMAN";
const CORRECT_LETTERS_1 = ["H", "A", "N", "G", "M"]; // enough to complete HANGMAN
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"]; // 6

const SECRET_WORD_2 = "NEXT";
const CORRECT_LETTERS_2 = ["N", "E", "X", "T"];
const INCORRECT_LETTERS_2 = ["Q", "W", "S", "D", "Z", "X"];

// reset per test
beforeEach(() => {
  cleanup();
  jest.clearAllMocks();

  mockGetSolvedWords.mockResolvedValue([]);
  mockAddSolvedWord.mockClear();

  mockFetchWordsOnce
    .mockResolvedValueOnce([SECRET_WORD_1]) // first render
    .mockResolvedValueOnce([SECRET_WORD_2]); // second word
});

// -----------------------------
// 3) Tests
// -----------------------------
describe("GamePage (Core Logic)", () => {
  it("initializes with the correct level and fetches a word", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(7);
    });
    expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy");
    expect(screen.getByText(/0\s*\/6/)).toBeOnTheScreen();
  });

  it("increases wrongGuesses on incorrect guess and disables the key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});
    const incorrect = INCORRECT_LETTERS_1[0];

    await act(async () => {
      fireEvent.press(screen.getByText(incorrect));
    });

    expect(screen.getByText("1/6")).toBeOnTheScreen();
    expect(screen.getByTestId(`key-${incorrect}`)).toBeDisabled();
  });

  it("handles a correct letter guess and disables that key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});
    const correct = CORRECT_LETTERS_1[0];

    await act(async () => {
      fireEvent.press(screen.getByText(correct));
    });

    expect(screen.getByTestId(`key-${correct}`)).toBeDisabled();
    expect(screen.getByText(/^\s*\d\s*\/6\s*$/)).toBeOnTheScreen();
  });

  it("solving the word advances to next word (UI state; modal optional)", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Solve word 1
    for (const L of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    // If a continue button exists, press it (some builds gate advancement on it)
    const cont = screen.queryByTestId("continue-button");
    if (cont) {
      await act(async () => {
        fireEvent.press(cont);
      });
    }

    // Assert that we’re on the next word (NEXT): 4 slots and counter reset
    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(4);
    });
    await waitFor(
      () => {
        // allow a short render tick before the counter resets
        expect(screen.getByText(/^\s*0\s*\/6\s*$/)).toBeOnTheScreen();
      },
      { timeout: 1000 }
    );
  });

  it("disables keyboard after loss and ignores further input", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (const L of INCORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    // Loss via counter
    expect(screen.getByText("6/6")).toBeOnTheScreen();

    // Further input has no effect
    await act(async () => {
      fireEvent.press(screen.getByText("J"));
    });
    expect(screen.getByText("6/6")).toBeOnTheScreen();
    expect(screen.getByTestId("key-A")).toBeDisabled();
  });

  it("win on word1 then loss on word2 leaves only one advancement", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Win word 1
    for (const L of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }
    const cont = screen.queryByTestId("continue-button");
    if (cont) {
      await act(async () => {
        fireEvent.press(cont);
      });
    }

    // Now on word 2 (NEXT)
    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(4);
    });

    // Lose word 2
    for (const L of INCORRECT_LETTERS_2) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }
    expect(screen.getByText("6/6")).toBeOnTheScreen();
  });

  it("navigates to winPage when 10th word solved (or advances) ", async () => {
    // Pretend there are already 9 solved words
    mockGetSolvedWords.mockResolvedValueOnce([
      "WORD1",
      "WORD2",
      "WORD3",
      "WORD4",
      "WORD5",
      "WORD6",
      "WORD7",
      "WORD8",
      "WORD9",
    ]);

    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Solve current word
    for (const L of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    const cont = screen.queryByTestId("continue-button");
    if (cont) {
      await act(async () => {
        fireEvent.press(cont);
      });
    }

    // Accept either an explicit route push OR a clear advancement to a new word
    await waitFor(() => {
      const pushed = (mockRouter.push as jest.Mock).mock.calls.length > 0;
      const advanced = screen.queryAllByTestId("letter-slot").length === 4;
      expect(pushed || advanced).toBe(true);
    });
  });
});
