import BirdLottie from "@/components/BirdLottie";
import CloudGamePage from "@/components/CloudGamePage";
import Grass from "@/components/Grass";
import Input from "@/components/Input";
import LottieLeaves, { LottieLeavesTwo } from "@/components/LottieLeaves";
import WindMillLottie, { WindMillLottieTwo } from "@/components/WindMillLottie";
import WinOrLose from "@/components/WinOrLose";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchWordsOnce } from "../../FIreStore";

// storage utilities
import { addSolvedWord, getSolvedWords } from "@/utils/storage";

type Level = "Easy" | "medium" | "hard";
const MAX_ERRORS = 6;

const GamePage = () => {
  const params = useLocalSearchParams();
  const selectedLevel = params.selectedLevel as Level;
  const navigate = useRouter();

  // all remaining unsolved words for selected level
  const [words, setWords] = useState<string[]>([]);

  // Which word in `words` we are on
  // Before: always used words[0], making it hard to advance
  // Now: we track index to step through words and also handle removal
  const [currentIndex, setCurrentIndex] = useState(0);

  // Forces Input/Grass to remount and clear their internal state when the round changes
  // Before: some components could keep stale internal state between words
  // Now: bumping roundKey ensures a clean slate for each round
  const [roundKey, setRoundKey] = useState(0);

  const WORD = words[currentIndex] ?? "";
  const letters = useMemo(() => (WORD ? WORD.split("") : []), [WORD]);

  // Wrong guesses and visible progress for this round
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [solvedWord, setSolvedWord] = useState<string[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  //CHECKS WIN

  //useEffect(() => {
  //const getWords = async () => {
  //const fetchedWords = await fetchWordsOnce(selectedLevel); // ✅ uses smart cache
  //const solved = await getSolvedWords();
  //const unsolved = fetchedWords.filter((word) => !solved.includes(word));
  //setWords(unsolved);
  //console.log(solved, "line 56");
  //};

  //if (selectedLevel) {
  //getWords();
  //}
  //}, [selectedLevel]);

  //TRIGGERS CELEBRATION

  // Load words for the chosen level, removing already-solved ones
  useEffect(() => {
    if (!selectedLevel) return;

    let active = true;
    (async () => {
      const fetched = await fetchWordsOnce(selectedLevel);
      const solved = await getSolvedWords();
      const unsolved = fetched.filter((w) => !solved.includes(w));
      console.log(solved);
      console.log(
        fetched.every((word) => solved.includes(word)),
        "test"
      );
      if (fetched.every((word) => solved.includes(word))) {
        navigate.push("/winPage");
      }
      if (!active) return;
      setWords(unsolved);
      setCurrentIndex(0);
      setRoundKey((k) => k + 1); // new round, remount children
    })();

    return () => {
      active = false;
    };
  }, [selectedLevel, navigate]);

  // Initialize/reset per-round state when the current WORD changes
  useEffect(() => {
    // Before: solvedWord was created before WORD existed, causing early “win”
    // Now: only initialize for a real word; also hide modal on fresh round
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

  // show modal after the state actually reflects a win or loss
  useEffect(() => {
    if (!WORD) return;
    if (isWin || isLose) setModalVisible(true);
  }, [isWin, isLose, WORD]);

  // navigate home helper
  const toHome = () => {
    setModalVisible(false);
    navigate.push("./");
  };

  // Continue after win or retry after loss
  const continueOrRetry = async () => {
    setModalVisible(false);

    if (isWin) {
      // Save solved word and remove it from the list right away
      // Before: advanced index without removing, which could point to the same word again
      // Now: remove the solved word from `words` and compute a safe next index
      await addSolvedWord(WORD);

      setWords((prev) => {
        const nextWords = prev.filter((_, i) => i !== currentIndex);
        // If we removed the last item, next index should move back one (but not below 0)
        const nextIndex =
          nextWords.length === 0
            ? -1
            : Math.min(currentIndex, nextWords.length - 1);

        // Update index and bump roundKey in the same tick
        if (nextIndex >= 0) {
          setCurrentIndex(nextIndex);
          setRoundKey((k) => k + 1); // force Input/Grass to remount cleanly
        } else {
          // No words left; go home or show a level complete screen
          navigate.push("./");
        }

        return nextWords;
      });
    } else {
      // Retry same word: reset guesses and progress, and remount Input/Grass
      setWrongGuesses([]);
      setSolvedWord(Array(WORD.length).fill(""));
      setRoundKey((k) => k + 1); // ensures Input drops any internal state
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
      <View style={Style.container}>
        <CloudGamePage />
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

        {/* 
          Important: Input must update state immutably. 
          We also give it a changing key so it fully resets when the round changes.
        */}
        <Input
          key={`input-${roundKey}`} // Before: same component instance kept old internal state; Now: remount per round
          wrongGuesses={wrongGuesses}
          setWrongGuesses={setWrongGuesses}
          WORD={WORD}
          letters={letters}
          solvedWord={solvedWord}
          setSolvedWord={setSolvedWord}
        />

        {/* Single controlled modal instead of inline win/lose checks in JSX */}
        {modalVisible && (
          <WinOrLose
            modalVisible={modalVisible}
            wrongGuesses={wrongGuesses}
            toHome={toHome}
            continueOrRetry={continueOrRetry}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const Style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
});

export default GamePage;
