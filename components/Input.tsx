import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Keyboard from "./Keyboard";
import TextInpt from "./TextInpt";

type props = {
  wrongGuesses: string[];
  setWrongGuesses: (letters: string[]) => void;
  WORD: string;
  letters: string[];
  solvedWord: string[];
  setSolvedWord: React.Dispatch<React.SetStateAction<string[]>>;
};
const Input = ({
  wrongGuesses,
  setWrongGuesses,
  WORD,
  letters,
  solvedWord,
  setSolvedWord,
}: props) => {
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([]);

  const handleGuess = useCallback(
    (guess: string) => {
      const letter = guess.toLowerCase();
      if (!WORD.includes(letter) && !wrongGuesses.includes(letter)) {
        setWrongGuesses([...wrongGuesses, letter]);
      }
      if (WORD.includes(letter)) {
        if (!correctGuesses.includes(letter)) {
          setCorrectGuesses((prev) => [...prev, letter]);
        }
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
    [
      setWrongGuesses,
      solvedWord,
      wrongGuesses,
      WORD,
      setSolvedWord,
      correctGuesses,
    ]
  );
  return (
    <View style={{ width: "100%" }}>
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
      <Text style={styles.guessList}>
        Wrong Guesses:{" "}
        <Text style={{ color: "red" }}>
          {wrongGuesses.join(", ").toLowerCase()}
        </Text>
      </Text>
      <Keyboard
        onKeyPress={handleGuess}
        correctGuesses={correctGuesses}
        wrongGuesses={wrongGuesses}
        isGameOver={wrongGuesses.length >= 6} // Add your game over condition
      />
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
