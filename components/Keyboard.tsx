import { Audio } from "expo-av";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  //const play = useSound(soundMap);

  const clickSound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/singleTap.wav")
      );
      if (mounted) clickSound.current = sound;
    })();

    return () => {
      mounted = false;
      clickSound.current?.unloadAsync();
    };
  }, []);

  const playClick = async () => {
    const s = clickSound.current;
    if (!s) return;
    try {
      await s.stopAsync().catch(() => {});
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch (err) {
      console.log("Sound error:", err);
    }
  };

  const getButtonState = (letter: string) => {
    if (isGameOver) return "disabled";
    if (correctGuesses.includes(letter)) return "correct";
    if (wrongGuesses.includes(letter)) return "wrong";
    return "default";
  };

  const getButtonStyle = (state: string) => {
    switch (state) {
      case "correct":
        return { backgroundColor: "#5aa02c" };
      case "wrong":
        return { backgroundColor: "#FFAB91" };
      case "disabled":
        return { backgroundColor: "#EBEBEB" };
      default:
        return { backgroundColor: "#FFFDE0" };
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
              <TouchableOpacity
                key={letter}
                style={[styles.keyButton, getButtonStyle(buttonState)]}
                onPress={() => {
                  if (!isDisabled) {
                    playClick();
                    onKeyPress(letter);
                  }
                }}
                disabled={isDisabled}
              >
                <Text style={[styles.keyText, getButtonTextStyle(buttonState)]}>
                  {letter.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}

          {rowIndex === 1 && <View style={styles.rowSpacer} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    marginTop: "50%",
    padding: 8,
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  rowSpacer: {
    width: 15,
  },
  keyButton: {
    flex: 1,
    maxWidth: 40,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 3,
  },
  keyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#424242",
  },
});

export default Keyboard;
