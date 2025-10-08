import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Define the keyboard layout (QWERTY for simplicity)
const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

type CustomKeyboardProps = {
  onKeyPress: (letter: string) => void; // Function to call when a letter is pressed
  //   correctGuesses: string[]; // List of correctly guessed letters
  wrongGuesses: string[]; // List of incorrectly guessed letters
  isGameOver: boolean; // To disable keyboard when game is over
};

const Keyboard = ({
  onKeyPress,
  //   correctGuesses,
  wrongGuesses,
  isGameOver,
}: CustomKeyboardProps) => {
  const getButtonState = (letter: string) => {
    if (isGameOver) {
      return "disabled";
    }
    // if (correctGuesses.includes(letter)) {
    //   return "correct";
    // }
    if (wrongGuesses.includes(letter)) {
      return "wrong";
    }
    return "default";
  };

  const getButtonStyle = (state: string) => {
    switch (state) {
      case "correct":
        return { backgroundColor: "#C8E6C9" }; // Soft green (like top game area)
      case "wrong":
        return { backgroundColor: "#FFCDD2" }; // Soft red/pink
      case "disabled":
        return { backgroundColor: "#E0E0E0" }; // Light grey
      default:
        return { backgroundColor: "transparent" }; // White/default background
    }
  };

  const getButtonTextStyle = (state: string) => {
    switch (state) {
      case "disabled":
        return { color: "#9E9E9E" }; // Darker grey for disabled text
      default:
        return { color: "#333333" }; // Dark text
    }
  };

  return (
    <View style={styles.keyboardContainer}>
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyboardRow}>
          {row.map((letter) => {
            const buttonState = getButtonState(letter);
            const isDisabled = buttonState !== "default" || isGameOver;
            return (
              <TouchableOpacity
                key={letter}
                style={[styles.keyButton, getButtonStyle(buttonState)]}
                onPress={() => onKeyPress(letter)}
                disabled={isDisabled}
              >
                <Text style={[styles.keyText, getButtonTextStyle(buttonState)]}>
                  {letter.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    position: "absolute", // Assuming you added this property
    top: "150%",
    left: 0, // Anchor to the left edge
    right: 0, // Anchor to the right edge (Forces 100% width)
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  keyButton: {
    width: "8%", // Adjust size as needed for different screen sizes
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3, // Space between buttons in a row
    elevation: 0,
    backgroundColor: "transparent",
    borderRadius: 10,
    boxShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  keyText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default Keyboard;
