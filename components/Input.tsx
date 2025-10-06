import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TextInpt from "./TextInpt";

const WORD = "parrot";
const letters = WORD.split("");
type props = {
  wrongGuesses: string[];
  setWrongGuesses: (letters: string[]) => void;
};
const Input = ({ wrongGuesses, setWrongGuesses }: props) => {
  const [solvedWord, setSolvedWord] = useState<string[]>(
    Array(WORD.length).fill("")
  );

  const [currentGuess, setCurrentGuess] = useState<string>("");

  const handleGuess = useCallback(
    (guess: string) => {
      const letter = guess.toLowerCase();
      if (!WORD.includes(letter) && !wrongGuesses.includes(letter)) {
        setWrongGuesses([...wrongGuesses, letter]);
      }
      if (WORD.includes(letter)) {
        const newSolvedWord = [...solvedWord];
        let newLetterFound = false;

        for (let i = 0; i < WORD.length; i++) {
          if (WORD[i] === letter && newSolvedWord[i] === "") {
            newSolvedWord[i] = letter;
            newLetterFound = true;
          }
        }

        if (newLetterFound) {
          setSolvedWord(newSolvedWord);
        }
      }
      setCurrentGuess("");
    },
    [setWrongGuesses, solvedWord, wrongGuesses]
  );
  return (
    <View>
      <View style={styles.container}>
        {letters.map((letter, index) => {
          const displayValue = solvedWord[index];
          const borderC = displayValue !== "" ? "green" : "black";

          return (
            <View
              key={index}
              style={{
                width: 40,
                marginHorizontal: 4,
                display: "flex",
                borderBottomColor: borderC,
                borderBottomWidth: 2,
              }}
            >
              <TextInpt
                value={letter}
                displayValue={displayValue}
                onGuess={handleGuess}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
            </View>
          );
        })}
      </View>

      {/* <Text style={styles.guessList}>
        Guessed Letters: {correctGuesses.join(", ").toUpperCase()}
      </Text> */}
      <Text style={styles.guessList}>
        Wrong Guesses:{" "}
        <Text style={{ color: "red" }}>
          {wrongGuesses.join(", ").toLowerCase()}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  guessList: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#33",
  },
});
export default Input;
