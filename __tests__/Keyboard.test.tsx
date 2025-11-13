import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import Keyboard from "../components/Keyboard";

// Mock soundManager so .play() does nothing
jest.mock("../audio/SoundManager", () => ({
  soundManager: {
    play: jest.fn(),
  },
}));

describe("Keyboard Component", () => {
  it("calls onKeyPress when a key is pressed", () => {
    const mockPress = jest.fn();

    const { getByTestId } = render(
      <Keyboard
        onKeyPress={mockPress}
        correctGuesses={[]}
        wrongGuesses={[]}
        isGameOver={false}
      />
    );

    const keyA = getByTestId("key-A");
    fireEvent.press(keyA);

    expect(mockPress).toHaveBeenCalledWith("A");
  });

  it("disables wrong guessed keys", () => {
    const { getByTestId } = render(
      <Keyboard
        onKeyPress={jest.fn()}
        correctGuesses={[]}
        wrongGuesses={["B"]}
        isGameOver={false}
      />
    );

    const keyB = getByTestId("key-B");
    expect(keyB.props.accessibilityState.disabled).toBe(true);
  });

  it("disables correct guessed keys", () => {
    const { getByTestId } = render(
      <Keyboard
        onKeyPress={jest.fn()}
        correctGuesses={["C"]}
        wrongGuesses={[]}
        isGameOver={false}
      />
    );

    const keyC = getByTestId("key-C");
    expect(keyC.props.accessibilityState.disabled).toBe(true);
  });

  it("disables all keys when game is over", () => {
    const { getByTestId } = render(
      <Keyboard
        onKeyPress={jest.fn()}
        correctGuesses={[]}
        wrongGuesses={[]}
        isGameOver={true}
      />
    );

    const keyZ = getByTestId("key-Z");
    expect(keyZ.props.accessibilityState.disabled).toBe(true);
  });

  it("does NOT call onKeyPress when key is disabled", () => {
    const mockPress = jest.fn();

    const { getByTestId } = render(
      <Keyboard
        onKeyPress={mockPress}
        correctGuesses={["D"]}
        wrongGuesses={[]}
        isGameOver={false}
      />
    );

    const keyD = getByTestId("key-D");
    fireEvent.press(keyD);

    expect(mockPress).not.toHaveBeenCalled();
  });
});
