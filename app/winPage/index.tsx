import { soundManager } from "@/audio/SoundManager";
import useClickSound from "@/audio/useClickSound";
import WinLottie, { WinCup } from "@/components/lottieFiles/WinLottie";
import { getSolvedWords } from "@/utils/storage";
import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { fetchWordsOnce } from "../../FIreStore";
import HeadphoneButton from "../../audio/HeadphoneButton";

import { useFocusEffect } from "@react-navigation/native";

type Level = "Easy" | "medium" | "hard";
export default function Index() {
  const params = useLocalSearchParams();
  const level = params.selectedLevel as Level;
  const navigate = useRouter();
  const playSound = useClickSound();

  useFocusEffect(
    useCallback(() => {
      soundManager.playLooping("winPage");
      return () => {
        soundManager.stopAll();
      };
    }, [])
  );

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  const handleRestart = async (level: Level) => {
    playSound();
    await soundManager.stopAll();
    const SOLVED_WORDS_KEY = "solved_words";
    const fetched = await fetchWordsOnce(level);
    const solved = await getSolvedWords();
    const remainingSolved = solved.filter((word) => !fetched.includes(word));
    try {
      await AsyncStorage.setItem(
        SOLVED_WORDS_KEY,
        JSON.stringify(remainingSolved)
      );
    } catch (error) {
      console.error("Error updating solved words on restart:", error);
    }
    Toast.show({
      type: "success",
      text1: `The Level ${level} has been reset`,
      visibilityTime: 2000,
    });
    setTimeout(() => {
      navigate.push("/");
    }, 2000);
  };

  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[Style.container, { zIndex: 100 }]}
    >
      <View style={{ position: "absolute", top: 40, right: 30, zIndex: 50 }}>
        <HeadphoneButton />
      </View>
      <Text style={Style.text}>
        Yaay! You&apos;ve completed the <Text style={Style.level}>{level}</Text>{" "}
        level
      </Text>
      <WinLottie />
      <WinCup />
      <Pressable
        style={[Style.buttonRestart, Style.button]}
        onPress={() => handleRestart(level)}
      >
        <Text style={Style.buttonText}>Restart Level</Text>
      </Pressable>
      <Pressable
        style={[Style.buttonHome, Style.button]}
        onPress={async () => {
          playSound();
          await soundManager.stopAll();
          navigate.push("/");
        }}
      >
        <Toast />
        <Text style={Style.buttonText}>Go Home</Text>
      </Pressable>
    </LinearGradient>
  );
}
const Style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
    width: "100%",
  },
  text: {
    fontFamily: "Nunito_800ExtraBold",
    fontStyle: "normal",
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    color: "#333",
  },
  level: {
    fontSize: 25,
    textTransform: "lowercase",
  },
  buttonRestart: {
    backgroundColor: "#FF6F61",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    boxShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    marginTop: 10,
    marginBottom: 5,
  },
  buttonHome: {
    backgroundColor: "#5AA02C",
  },
});
