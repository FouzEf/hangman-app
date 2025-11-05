import CloudGamePage from "@/components/CloudGamePage";
import Grass from "@/components/Grass";
import Input from "@/components/Input";
import BirdLottie from "@/components/lottieFiles/BirdLottie";
import LottieLeaves, {
  LottieLeavesTwo,
} from "@/components/lottieFiles/LottieLeaves";
import WindMillLottie, {
  WindMillLottieTwo,
} from "@/components/lottieFiles/WindMillLottie";
import WinOrLose from "@/components/WinOrLose";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import HeadphoneButton from "../../audio/HeadphoneButton";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchWordsOnce } from "../../WordService";

import { soundManager } from "@/audio/SoundManager";
import useClickSound from "@/audio/useClickSound";
import { addSolvedWord, getSolvedWords } from "@/utils/storage";

// NOTE: level values used in the app
type level = "Easy" | "medium" | "hard" | "Test";

const MAX_ERRORS = 6;

const GamePage = () => {
  const params = useLocalSearchParams();
  const selectedLevel = params.selectedLevel as level;
  const router = useRouter();

  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundKey, setRoundKey] = useState(0);

  const WORD = words[currentIndex] ?? "";
  const letters = useMemo(() => (WORD ? WORD.split("") : []), [WORD]);

  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [solvedWord, setSolvedWord] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const playSound = useClickSound();

  // wind ambience while in GamePage
  useEffect(() => {
    soundManager.playLooping("wind");
    return () => {
      soundManager.stop("wind");
      soundManager.stop("rope");
    };
  }, []);

  useEffect(() => {
    if (!selectedLevel) return;

    let active = true;
    (async () => {
      const fetched = await fetchWordsOnce(selectedLevel);
      const solved = await getSolvedWords();
      const unsolved = fetched.filter((w) => !solved.includes(w));

      if (fetched.every((word) => solved.includes(word))) {
        setTimeout(() => {
          router.push("/winPage");
        }, 0);
        return;
      }

      if (!active) return;
      setWords(unsolved);
      setCurrentIndex(0);
      setRoundKey((k) => k + 1);
    })();

    return () => {
      active = false;
    };
  }, [selectedLevel, router]);

  // reset per-round state when WORD changes
  useEffect(() => {
    if (!WORD) {
      setSolvedWord([]);
      setWrongGuesses([]);
      setModalVisible(false);
      return;
    }
    setSolvedWord(Array(WORD.length).fill(""));
    setWrongGuesses([]);
    setModalVisible(false);
  }, [WORD]);

  const isWin = WORD ? solvedWord.join("") === WORD : false;
  const isLose = wrongGuesses.length >= MAX_ERRORS;

  useEffect(() => {
    if (!WORD) return;
    if (isWin || isLose) setModalVisible(true);
  }, [isWin, isLose, WORD]);

  const toHome = () => {
    // ✅ match test expectation
    playSound();
    setModalVisible(false);
    soundManager.stop("wind");
    soundManager.stop("rope");
    router.push("/");
  };

  // play rope when a wrong guess is added
  const prevWrongLen = useRef(0);
  useEffect(() => {
    if (wrongGuesses.length > prevWrongLen.current) {
      soundManager.play("rope");
    }
    prevWrongLen.current = wrongGuesses.length;
  }, [wrongGuesses.length]);

  const continueOrRetry = async () => {
    playSound();
    setModalVisible(false);

    if (isWin) {
      if (selectedLevel !== "Test") {
        await addSolvedWord(WORD);
      }

      const nextWords = words.filter((_, i) => i !== currentIndex);
      const nextIndex =
        nextWords.length === 0
          ? -1
          : Math.min(currentIndex, nextWords.length - 1);

      setWords(nextWords);

      if (nextIndex >= 0) {
        setCurrentIndex(nextIndex);
        setRoundKey((k) => k + 1);
      } else {
        soundManager.stop("wind");
        soundManager.stop("rope");
        router.push({ pathname: "/winPage", params: { selectedLevel } });
      }
    } else {
      setWrongGuesses([]);
      setSolvedWord(Array(WORD.length).fill(""));
      setRoundKey((k) => k + 1);
    }
  };

  const isLoading = !selectedLevel || (words.length === 0 && !WORD);

  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >
      <View testID="game-page-container" style={{ flex: 1 }}>
        {/* small HUD bits the tests assert on */}
        <Text style={Style.Counter}>Wrong Guesses: {wrongGuesses.length}</Text>

        <Text
          style={[
            Style.Level,
            {
              backgroundColor:
                selectedLevel === "Easy"
                  ? "#4CAF50"
                  : selectedLevel === "medium"
                    ? "#FFC107"
                    : selectedLevel === "hard"
                      ? "#F44336"
                      : selectedLevel === "Test"
                        ? "#9C27B0"
                        : "#ccc",
            },
          ]}
        >
          {selectedLevel}
        </Text>

        <ScrollView contentContainerStyle={Style.scrollContent}>
          <View style={Style.gameSceneContainer}>
            <CloudGamePage />
            <View
              style={{ position: "absolute", top: 10, right: 20, zIndex: 50 }}
            >
              <HeadphoneButton />
            </View>

            <WindMillLottie />
            <WindMillLottieTwo />
            <BirdLottie />
            <LottieLeaves />
            <LottieLeavesTwo />

            {isLoading && (
              <Text style={{ position: "absolute", top: 60 }}>Loading...</Text>
            )}

            {/* key forces a remount per round so any internal state is cleared */}
            <Grass key={`grass-${roundKey}`} wrongGuesses={wrongGuesses} />
          </View>

          <Input
            key={`input-${roundKey}`}
            wrongGuesses={wrongGuesses}
            setWrongGuesses={setWrongGuesses}
            WORD={WORD}
            letters={letters}
            solvedWord={solvedWord}
            setSolvedWord={setSolvedWord}
          />

          {modalVisible && (
            <WinOrLose
              modalVisible={modalVisible}
              wrongGuesses={wrongGuesses}
              toHome={toHome}
              continueOrRetry={continueOrRetry}
            />
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const Style = StyleSheet.create({
  container: { flex: 1, position: "relative", width: "100%" },
  scrollContent: { justifyContent: "space-between", paddingTop: 70 },
  gameSceneContainer: { width: "100%" },
  Level: {
    marginVertical: 10,
    paddingVertical: 5,
    textAlign: "center",
    color: "#f5f5f5",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 12,
    borderRadius: 10,
    width: 50,
    // NOTE: RN doesn't support "auto" or CSS boxShadow, but tests don't depend on it.
    // Keeping styles minimal and harmless for test env:
    position: "absolute",
    top: "5%",
    right: "6%",
    zIndex: 50,
    textTransform: "lowercase",
  },
  Counter: {
    position: "absolute",
    left: 16,
    top: 16,
    fontSize: 14,
  },
});

export default GamePage;
export { GamePage };
