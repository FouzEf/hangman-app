import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const Input = () => {
  const [text, setText] = useState("apple");
  const [answer, setAnswer] = useState("a");

  const letters = text.split("");

  return (
    <View style={styles.container}>
      {letters.map((letter, index) => {
        const isMatch = letter === answer;
        return (
          <View key={index} style={styles.letterBox}>
            <Text style={[styles.letter, !isMatch && styles.hiddenLetter]}>
              {letter}
            </Text>
            <View
              style={[
                styles.underline,
                { borderBottomColor: isMatch ? "green" : "black" },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "80%",
    justifyContent: "space-between",
  },
  letterBox: {
    alignItems: "center",
  },
  letter: {
    fontSize: 18,
    marginBottom: 4,
    color: "black",
  },
  hiddenLetter: {
    color: "transparent",
  },
  underline: {
    borderBottomWidth: 2,
    width: 20,
  },
});

export default Input;
