// __tests__/GamePage.test.tsx

// -----------------------------
// 0) Mocks (declare BEFORE imports that use them)
// -----------------------------

// FIX: COMPLETE Mock for soundManager, fixing errors for playLooping and setMuted.
jest.mock("../audio/SoundManager", () => ({
  soundManager: {
    play: jest.fn(),
    // New mocks to fix the latest errors:
    playLooping: jest.fn(),
    stop: jest.fn(),
    setMuted: jest.fn().mockResolvedValue(undefined),
    preloadAll: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock all image assets used in Grass.tsx to prevent loading errors.
jest.mock("@assets/images/gallow.png", () => "test-file-stub");
jest.mock("@assets/images/grass3.png", () => "test-file-stub");
jest.mock("@assets/images/HomButton.png", () => "test-file-stub");
jest.mock("@assets/images/Stage1.png", () => "test-file-stub");
jest.mock("@assets/images/Stage2.png", () => "test-file-stub");
jest.mock("@assets/images/Stage3.png", () => "test-file-stub");
jest.mock("@assets/images/Stage4.png", () => "test-file-stub");
jest.mock("@assets/images/Stage5.png", () => "test-file-stub");
jest.mock("@assets/images/Stage6.png", () => "test-file-stub");

// FIX: Stub Input and Keyboard components to prevent TypeError related to Animated/Native code.
jest.mock("../components/Input", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stub = (props: any) => React.createElement(View, props, props.children);
  Stub.displayName = "Input";
  return Stub;
});

jest.mock("../components/Keyboard", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stub = (props: any) => React.createElement(View, props, props.children);
  Stub.displayName = "Keyboard";
  return Stub;
});

// WordService — mock both likely import paths so whichever GamePage uses will match.
const mockFetchWordsOnce = jest.fn();
jest.mock("../WordService", () => ({
  // GamePage calls fetchWordsOnce(level, solvedArray). It expects an ARRAY of words.
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));
// jest.mock("../WordService", () => ({
//   fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
// }));

// storage — allow per-test override of getSolvedWords
const mockAddSolvedWord = jest.fn();
const mockGetSolvedWords = jest.fn().mockResolvedValue([]);
jest.mock("../utils/storage", () => ({
  addSolvedWord: (...args: any[]) => mockAddSolvedWord(...args),
  getSolvedWords: (...args: any[]) => mockGetSolvedWords(...args),
}));

// expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

// Stub CloudGamePage to avoid RN Animated native renderer in tests
jest.mock("../components/CloudGamePage", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stub = () => React.createElement(View, null);
  Stub.displayName = "CloudGamePage";
  return Stub;
});

// FIX: Stub Grass to avoid RN Animated native renderer and fix "reading 'S'" TypeError
jest.mock("../components/Grass", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stub = () => React.createElement(View, null);
  Stub.displayName = "Grass";
  return Stub;
});

// lottie-react-native — mock imperative methods (.play/.pause/.reset)
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

// expo-av — include Audio.Sound.createAsync and setVolumeAsync, etc.
jest.mock("expo-av", () => {
  // one shared "Sound" instance shape with all methods your SoundManager uses
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

  // constructor used when `new Audio.Sound()` is called
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

// Attach createAsync after the module exists
const expoAv = require("expo-av");
expoAv.Audio.Sound.createAsync = jest.fn(async () => ({
  sound: new expoAv.Audio.Sound(),
  status: {},
}));

// Optional: silence EXPO_OS warning paths in some libs
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

// Mocked words
const SECRET_WORD_1 = "HANGMAN";
const CORRECT_LETTERS_1 = ["H", "A", "N", "G", "M"];
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"]; // 6 letters

const SECRET_WORD_2 = "NEXT";
const CORRECT_LETTERS_2 = ["N", "E", "X", "T"];
const INCORRECT_LETTERS_2 = ["Q", "W", "S", "D", "Z", "X"];

// expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};
const mockSearchParams = { selectedLevel: "Easy" };

jest.mock("expo-router", () => {
  const React = require("react");
  const ActualModule = jest.requireActual("expo-router");
  return {
    ...ActualModule,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockSearchParams,
    Link: ({ href, children, onPress, ...rest }: any) => (
      <ActualModule.Link href={href} onPress={onPress} {...rest}>
        {children}
      </ActualModule.Link>
    ),
  };
});

// Reset mocks before each test
beforeEach(() => {
  cleanup();
  jest.clearAllMocks();

  // default storage behavior
  mockGetSolvedWords.mockResolvedValue([]);

  // IMPORTANT: GamePage expects an ARRAY from fetchWordsOnce
  mockFetchWordsOnce
    .mockResolvedValueOnce([SECRET_WORD_1]) // First call returns ["HANGMAN"]
    .mockResolvedValueOnce([SECRET_WORD_2]); // Second call returns ["NEXT"]
});

// -----------------------------
// 3) Tests
// -----------------------------

describe("GamePage (Core Logic)", () => {
  it("should initialize with the correct level and fetch a word", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {}); // FIX: Added act to ensure initial async word fetch completes

    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(7);
    });

    // FIX: The initial call only passes 'Easy', so we update the assertion.
    expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy");
    expect(screen.queryByText(SECRET_WORD_1)).toBeNull();
    expect(screen.getByText("0")).toBeOnTheScreen();
  });

  it("should increase wrongGuesses on incorrect guess and disable the key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    const incorrectLetter = INCORRECT_LETTERS_1[0]; // 'B'

    await act(async () => {
      fireEvent.press(screen.getByText(incorrectLetter));
    });

    expect(screen.getByText("1/6")).toBeOnTheScreen();
    expect(screen.getByText(incorrectLetter)).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByText(incorrectLetter));
    });

    expect(screen.getByText("1/6")).toBeOnTheScreen();
  });

  it("should handle a correct letter guess, revealing letters and disabling the key", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    const correctLetter = CORRECT_LETTERS_1[0]; // 'H'

    await act(async () => {
      fireEvent.press(screen.getByText(correctLetter));
    });

    expect(screen.getByText(correctLetter)).toBeOnTheScreen();
    expect(screen.getAllByText("_").length).toBe(6);
    expect(screen.getByText("0/6")).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByText(correctLetter));
    });

    expect(screen.getAllByText("_").length).toBe(6);
    expect(screen.getByText("0/6")).toBeOnTheScreen();
  });

  it("should show WIN modal when solving the word", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
      expect(screen.getByText(SECRET_WORD_1)).toBeOnTheScreen();
    });

    expect(mockAddSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1, "Easy");
  });

  it("should show LOSE modal after 6 wrong guesses", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (let i = 0; i < INCORRECT_LETTERS_1.length; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_1[i]));
      });
    }

    expect(screen.getByText("6/6")).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
      expect(screen.getByText(SECRET_WORD_1)).toBeOnTheScreen();
    });

    expect(mockAddSolvedWord).not.toHaveBeenCalled();
  });

  it("should disable the keyboard and prevent further guesses when the game is over (loss)", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_1[i]));
      });
    }

    const slots = await screen.findAllByText("_", {}, { timeout: 2000 });
    expect(slots).toHaveLength(7);

    const seventhIncorrectLetter = "J";
    await act(async () => {
      fireEvent.press(screen.getByText(seventhIncorrectLetter));
    });

    expect(screen.getByText("6/6")).toBeOnTheScreen();
  });

  it("should reset state and load a new word when 'Continue' is pressed after a win", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(screen.getByText("0/6")).toBeOnTheScreen();
    expect(screen.getAllByText("_").length).toBe(4); // "NEXT"
    expect(screen.queryByText(SECRET_WORD_1)).toBeNull();
  });

  it("should handle Win (Word 1) followed by Loss (Word 2) correctly, only counting the win", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Win word 1
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(mockAddSolvedWord).toHaveBeenCalledWith(SECRET_WORD_1, "Easy");
      expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
    });

    // Continue to word 2
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    // Lose word 2
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.press(screen.getByText(INCORRECT_LETTERS_2[i]));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("You Lost!")).toBeOnTheScreen();
    });

    // Still only one win recorded
    expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
  });

  it("should navigate home when pressing To Home", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("To Home")).toBeOnTheScreen();
    });

    await act(async () => {
      fireEvent.press(screen.getByText("To Home"));
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should check level completion status when 10 words are solved", async () => {
    // Simulate there are already 9 solved words
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

    // Solve the 10th word
    for (const letter of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(letter));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("You Won!")).toBeOnTheScreen();
    });

    expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(mockRouter.push).toHaveBeenCalledWith("winPage");
  });
});
