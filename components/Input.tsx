import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TextInpt from "./TextInpt";

const WORD = "parrot";
const letters = WORD.split("");

const Input = () => {
  // State to track the solved word, initialized with empty slots
  const [solvedWord, setSolvedWord] = useState<string[]>(
    Array(WORD.length).fill("")
  );

  // State for the single letter the user is currently typing/guessing in the input field
  const [currentGuess, setCurrentGuess] = useState<string>("");

  // State to keep a list of ALL letters successfully found
  // const [correctGuesses, setCorrectGuesses] = useState<string[]>([]);

  // State to keep a list of ALL letters guessed wrongly
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);

  // This function is called from the TextInpt component when the user types a character.
  const handleGuess = useCallback(
    (guess: string) => {
      const letter = guess.toLowerCase();
      if (!WORD.includes(letter) && !wrongGuesses.includes(letter)) {
        setWrongGuesses((prev) => [...prev, letter]);
      }
      if (WORD.includes(letter)) {
        // if (!correctGuesses.includes(letter)) {
        //   setCorrectGuesses((prev) => [...prev, letter]);
        // }
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
    [solvedWord, wrongGuesses]
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
        Guessed Letters:{" "}
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
