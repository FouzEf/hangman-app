// -----------------------------
// Imports
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
// Word service mock (shared)
// -----------------------------
const mockFetchWordsOnce = jest.fn();
jest.mock("../WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));
jest.mock("@/WordService", () => ({
  fetchWordsOnce: (...args: any[]) => mockFetchWordsOnce(...args),
}));

// -----------------------------
// Router mock
// -----------------------------
const mockRouter = {
  push: jest.fn(),
};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({
    selectedLevel: "Easy",
  }),
}));

// -----------------------------
// Storage mocks
// -----------------------------
const mockAddSolvedWord = jest.fn();
const mockGetSolvedCount = jest.fn();

jest.mock("@/WordService", () => ({
  addSolvedWord: (...args: any[]) => mockAddSolvedWord(...args),
  getSolvedCount: (...args: any[]) => mockGetSolvedCount(...args),
}));

// -----------------------------
// Helper: render with providers
// -----------------------------
function renderWithProviders(ui: React.ReactElement) {
  return render(<SoundSettingsProvider>{ui}</SoundSettingsProvider>);
}

// -----------------------------
// Test data
// -----------------------------
const SECRET_WORD_1 = "HANGMAN";
const SECRET_WORD_2 = "NEXT";

const CORRECT_LETTERS_1 = SECRET_WORD_1.split(""); // H A N G M A N
const INCORRECT_LETTERS_1 = ["B", "C", "D", "E", "F", "I"];

beforeEach(() => {
  jest.clearAllMocks();

  mockFetchWordsOnce.mockResolvedValue([SECRET_WORD_1, SECRET_WORD_2]);
  mockGetSolvedCount.mockResolvedValue(0);

  cleanup();
});

// --------------------------------------------------------
// 3) Tests
// --------------------------------------------------------
describe("GamePage (Core Logic)", () => {
  // ------------------------------------------------------
  it("initializes with the correct level and fetches a word", async () => {
    renderWithProviders(<GamePage />);

    await act(async () => {});

    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(7);
    });

    expect(mockFetchWordsOnce).toHaveBeenCalledWith("Easy");
    expect(screen.getByText(/^\s*0\s*\/6\s*$/)).toBeOnTheScreen();
  });

  // ------------------------------------------------------
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

  // ------------------------------------------------------
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

  // ------------------------------------------------------
  it("solving the word advances to next word (UI state; modal optional)", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Solve WORD 1
    for (const L of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    // Optional continue button (depends on modal existence)
    const cont = screen.queryByTestId("continue-button");
    if (cont) {
      await act(async () => {
        fireEvent.press(cont);
      });
    }

    // Assert next word (NEXT)
    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(4);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/^\s*0\s*\/6\s*$/)).toBeOnTheScreen();
      },
      { timeout: 1000 }
    );
  });

  // ------------------------------------------------------
  it("disables keyboard after loss and ignores further input", async () => {
    renderWithProviders(<GamePage />);
    await act(async () => {});

    for (const L of INCORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    expect(screen.getByText("6/6")).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByText("B"));
    });

    expect(screen.getByText("6/6")).toBeOnTheScreen();
  });

  // ------------------------------------------------------
  it("win on word1 then loss on word2 leaves only one advancement", async () => {
    mockGetSolvedCount.mockResolvedValueOnce(0);

    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Solve WORD 1
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

    await waitFor(() => {
      expect(screen.getAllByTestId("letter-slot").length).toBe(4);
    });

    // Lose WORD 2
    for (const L of INCORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    expect(mockAddSolvedWord).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------
  it("navigates to winPage when 10th word solved (or advances)", async () => {
    mockGetSolvedCount.mockResolvedValue(9);

    renderWithProviders(<GamePage />);
    await act(async () => {});

    // Solve WORD 1
    for (const L of CORRECT_LETTERS_1) {
      await act(async () => {
        fireEvent.press(screen.getByText(L));
      });
    }

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/winPage",
        params: { selectedLevel: "Easy" },
      })
    );
  });
});
