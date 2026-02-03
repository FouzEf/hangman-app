import useClickSound from "@/audio/useClickSound";
import Home from "@assets/images/HomButton.png";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { BounceIn, ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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
  const router = useRouter();
  const playSound = useClickSound();
  const homeScale = useSharedValue(1);

  const onHomePress = () => {
    playSound();
    homeScale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(1, { duration: 100 })
    );
    setTimeout(() => {
        router.replace("/");
    }, 150);
  };

  const homeBtnStyle = useAnimatedStyle(() => ({
      transform: [{ scale: homeScale.value }]
  }));

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
            <Animated.View
              entering={BounceIn.delay(index * 100).duration(500)}
              key={index}
              style={{
                width: 45, // Slightly wider
                height: 55, // Taller
                marginHorizontal: 4,
                display: "flex",
                borderBottomColor: borderC,
                borderBottomWidth: 3, // Thicker underline
                backgroundColor: 'rgba(255,255,255,0.7)', // Subtle background
                borderRadius: 8, // Rounded corners
                alignItems: 'center',
                justifyContent: 'center',
                // Shadow for depth
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <TextInpt
                value={letter}
                displayValue={displayValue}
                onGuess={handleGuess}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.guessContainer}>
        {/* Home Button placed absolutely to the left */}
         <AnimatedTouchableOpacity
            style={[styles.homeBtn, homeBtnStyle]}
            onPress={onHomePress}
            activeOpacity={0.7}
          >
            <Image
              source={Home}
              style={styles.homeIcon}
            />
          </AnimatedTouchableOpacity>

        <Text style={styles.guessLabel}>Wrong:</Text>
        <View style={styles.wrongGuessesBox}>
            {wrongGuesses.map((char, i) => (
                <Animated.Text 
                    entering={ZoomIn.springify().damping(12).delay(i * 100)}
                    key={i} 
                    style={styles.wrongGuessChar}
                >
                    {char.toUpperCase()}
                </Animated.Text>
            ))}
        </View>
      </View>
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
  guessContainer: {
     marginTop: 20,
     alignItems: 'center',
     width: '100%',
     position: 'relative', // For absolute home button
     minHeight: 40, // Ensure height for button
     justifyContent: 'center',
  },
  homeBtn: {
    position: "absolute",
    left: 20, // Align to left edge, similar to how it was in scene but now inline with content
    top: 5, // Center vertically roughly
    zIndex: 999,
    padding: 0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  homeIcon: {
      width: 35,
      height: 35,
      resizeMode: "contain",
      tintColor: '#FF6F61', 
  },
  guessLabel: {
      fontSize: 16,
      fontFamily: "Nunito_400Regular",
      color: "#555",
      marginBottom: 5,
  },
  wrongGuessesBox: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      minHeight: 30,
      justifyContent: 'center',
      gap: 8,
  },
  wrongGuessChar: {
      fontSize: 18,
      fontFamily: "Nunito_800ExtraBold",
      color: "#D32F2F", // Strong red
      backgroundColor: "rgba(255, 235, 238, 0.8)", // Light red bg
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',
  },
});
export default Input;
