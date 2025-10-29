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

import { Ionicons } from "@expo/vector-icons"; // NEW IMPORT
import { useFocusEffect } from "@react-navigation/native";

type Level = "Easy" | "medium" | "hard" | "Test"; // Updated to include "Test" based on previous context

export default function Index() {
  const params = useLocalSearchParams();
  const level = params.selectedLevel as Level;
  const navigate = useRouter();
  const playSound = useClickSound();

  useFocusEffect(
    useCallback(() => {
      // ✅ Sound: Ensure celebratory sound loops
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
      start={{ x: 0.5, y: 0.1 }}
      end={{ x: 0.5, y: 1.0 }}
      style={Style.container}
    >
      <View style={{ position: "absolute", top: 40, right: 30, zIndex: 50 }}>
        <HeadphoneButton />
      </View>

      <WinLottie />
      <WinCup />

      <Text style={Style.congrats}>CONGRATULATIONS!</Text>

      <Text style={Style.secondaryText}>
        You&apos;ve mastered the <Text style={Style.levelText}>{level}</Text>{" "}
        level!
      </Text>
      <Pressable
        style={[Style.buttonRestart, Style.button, Style.buttonShadowRestart]}
        onPress={() => handleRestart(level)}
      >
        <Text style={Style.buttonText}>Restart Level</Text>
      </Pressable>

      <Pressable
        style={[Style.buttonHome, Style.button, Style.buttonShadowHome]}
        onPress={async () => {
          playSound();
          await soundManager.stopAll();
          navigate.push("/");
        }}
      >
        {/* Added Home Icon */}
        <Ionicons
          name="home-outline"
          size={24}
          color="#FFFFFF"
          style={Style.buttonIcon}
        />
        <Text style={Style.buttonText}>Go Home</Text>
      </Pressable>

      <Toast />
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
  congrats: {
    color: "rgb(248, 234, 35)", // Deep gold color for text
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 120,
  },
  secondaryText: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#333",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 40,
  },
  levelText: {
    fontSize: 24,
    textTransform: "capitalize",
    color: "#000",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 15,
    minWidth: 220,
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonRestart: {
    backgroundColor: "#FF6F61",
  },
  buttonHome: {
    backgroundColor: "#5AA02C",
  },

  buttonShadowRestart: {
    shadowColor: "#FF6F61",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonShadowHome: {
    shadowColor: "#5AA02C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20, // Slightly larger font
    fontFamily: "Nunito_800ExtraBold",
    fontWeight: "800",
  },
  buttonIcon: {
    marginRight: 10,
  },
});
