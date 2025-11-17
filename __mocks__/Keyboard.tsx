import React from "react";
import { Pressable, Text } from "react-native";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
type KeyboardMockProps = {
  onKeyPress?: (L: string) => void;
  correctGuesses?: string[];
  wrongGuesses?: string[];
  isGameOver?: boolean;
};
export default function KeyboardMock({
  onKeyPress = () => {},
  correctGuesses = [],
  wrongGuesses = [],
  isGameOver = false,
}: KeyboardMockProps) {
  return (
    <>
      {letters.map((L) => {
        const disabled =
          isGameOver ||
          correctGuesses.includes(L) ||
          correctGuesses.includes(L.toUpperCase()) ||
          wrongGuesses.includes(L) ||
          wrongGuesses.includes(L.toUpperCase());

        return (
          <Pressable
            key={L}
            testID={`key-${L}`}
            disabled={disabled}
            onPress={() => !disabled && onKeyPress(L)}
          >
            <Text>{L}</Text>
          </Pressable>
        );
      })}
    </>
  );
}
