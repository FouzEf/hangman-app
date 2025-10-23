import WinLottie, { WinCup } from "@components/WinLottie";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWordsOnce } from "../../FIreStore";
import HeadphoneButton from "../../audio/HeadphoneButton";

// storage utilities
import useClickSound from "@/audio/useClickSound";
import { getSolvedWords } from "@/utils/storage";

type Level = "Easy" | "medium" | "hard";
export default function Index() {
  const params = useLocalSearchParams();
  const level = params.selectedLevel as Level;
  console.log(level, "levelValue");
  const navigate = useRouter();
  const playSound = useClickSound();

  const soundRef = useRef<Audio.Sound | null>(null);

  const [isSoundReady, setIsSoundReady] = useState(false);

  useEffect(() => {
    const playLoopingSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/winPage.mp3")
      );
      soundRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      setIsSoundReady(true); // ✅ mark as ready
    };

    playLoopingSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsSoundReady(false);
    };
  }, []);

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });
  if (!fontsLoaded) {
    return null;
  }

  const handleRestart = async (level: "Easy" | "medium" | "hard") => {
    playSound();
    if (isSoundReady && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsSoundReady(false);
    }
    const SOLVED_WORDS_KEY = "solved_words";

    const fetched = await fetchWordsOnce(level);
    const solved = await getSolvedWords();

    // Filter out solved words that belong to this level
    const remainingSolved = solved.filter((word) => !fetched.includes(word));

    // Update AsyncStorage with the filtered list using the correct key
    try {
      await AsyncStorage.setItem(
        SOLVED_WORDS_KEY,
        JSON.stringify(remainingSolved)
      );
    } catch (error) {
      console.error("Error updating solved words on restart:", error);
    }

    console.log(solved, remainingSolved);
    return navigate.push("/gamePage");
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
          if (isSoundReady && soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
            setIsSoundReady(false);
          }
          navigate.push("/");
        }}
      >
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
    fontWeight: 800,

    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    color: "#333",
    //textShadowColor: "rgba(0, 0, 0, 0.25)",
    //textShadowOffset: { width: 4, height: 4 },
    //textShadowRadius: 8,
  },
  level: {
    fontSize: 25,
    textTransform: "lowercase",
  },
  buttonRestart: {
    backgroundColor: "#ff6f61",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 500,
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
    backgroundColor: "#5aa02c",
  },
});
