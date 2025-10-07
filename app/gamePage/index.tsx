import BirdLottie from "@/components/BirdLottie";
import CloudGamePage from "@/components/CloudGamePage";
import Grass from "@/components/Grass";
import Input from "@/components/Input";
import LottieLeaves, { LottieLeavesTwo } from "@/components/LottieLeaves";
import WindMillLottie, { WindMillLottieTwo } from "@/components/WindMillLottie";
import WinOrLose from "@/components/WinOrLose";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const WORD = "parrot";
const letters = WORD.split("");
const GamePage = () => {
  // State to keep a list of ALL letters guessed wrongly
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [solvedWord, setSolvedWord] = useState<string[]>(
    Array(WORD.length).fill("")
  );
  console.log(solvedWord);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const navigate = useRouter();
  const toHome = () => {
    navigate.push("./");
    setModalVisible(!modalVisible);
  };
  const continueOrRetry = () => {
    navigate.push("./gamePage");
    setModalVisible(!modalVisible);
  };

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
        <Grass wrongGuesses={wrongGuesses} />
        <Input
          wrongGuesses={wrongGuesses}
          setWrongGuesses={setWrongGuesses}
          WORD={WORD}
          letters={letters}
          solvedWord={solvedWord}
          setSolvedWord={setSolvedWord}
        />
        {wrongGuesses.length >= 6 && (
          <WinOrLose
            modalVisible
            wrongGuesses={wrongGuesses}
            toHome={toHome}
            continueOrRetry={continueOrRetry}
          />
        )}
        {solvedWord.join("") === WORD && (
          <WinOrLose
            modalVisible
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
