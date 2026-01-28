import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { soundManager } from "../audio/SoundManager";

const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

type CustomKeyboardProps = {
  onKeyPress: (letter: string) => void;
  correctGuesses: string[];
  wrongGuesses: string[];
  isGameOver: boolean;
};

const Keyboard = ({
  onKeyPress,
  correctGuesses,
  wrongGuesses,
  isGameOver,
}: CustomKeyboardProps) => {
  const getButtonState = (letter: string) => {
    if (correctGuesses.includes(letter)) return "correct";
    if (wrongGuesses.includes(letter)) return "wrong";
    if (isGameOver) return "disabled";
    return "default";
  };

  const getButtonStyle = (state: string) => {
    switch (state) {
      case "correct":
        return { backgroundColor: "#81C784", borderColor: "#66BB6A" }; // Soft Green
      case "wrong":
        return { backgroundColor: "#E57373", borderColor: "#EF5350" }; // Soft Red
      case "disabled":
        return { backgroundColor: "#ECEFF1", borderColor: "#CFD8DC" };
      default:
        return { backgroundColor: "#FFFFFF", borderColor: "#E0E0E0" }; // Clean White
    }
  };

  const getButtonTextStyle = (state: string) => {
    switch (state) {
      case "disabled":
        return { color: "#9E9E9E" };
      case "correct":
        return { color: "#fff" };
      case "wrong":
        return { color: "#a3a3a3" };
      default:
        return { color: "#424242" };
    }
  };

  const onPressKey = (letter: string, disabled: boolean) => {
    if (disabled) return;
    soundManager.play("singleTap");
    onKeyPress(letter);
  };

  return (
    <View style={styles.keyboardContainer}>
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyboardRow}>
          {rowIndex === 1 && <View style={styles.rowSpacer} />}
          {row.map((letter) => {
            const buttonState = getButtonState(letter);
            const isGuessed =
              wrongGuesses.includes(letter) || correctGuesses.includes(letter);
            const isDisabled = isGuessed || isGameOver;
            return (
              <Pressable
                key={letter}
                style={[styles.keyButton, getButtonStyle(buttonState)]}
                onPress={() => onPressKey(letter, isDisabled)}
                disabled={isDisabled}
                testID={`key-${letter.toUpperCase()}`}
              >
                <Text style={[styles.keyText, getButtonTextStyle(buttonState)]}>
                  {letter.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
          {rowIndex === 1 && <View style={styles.rowSpacer} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: { width: "100%", padding: 8, marginTop: 10 },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  rowSpacer: { width: 15 },
  keyButton: {
    flex: 1,
    maxWidth: 40,
    height: 52, // Taller touch target
    borderRadius: 12, // Softer corners
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
    // Nicer shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0, // 'Clicky' feel shadow
    elevation: 4,
    borderBottomWidth: 3, // Physical key look
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  keyText: { fontSize: 18, fontWeight: "600", color: "#424242" },
});

export default Keyboard;
