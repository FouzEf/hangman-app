import WinLottie, { WinCup } from "@components/WinLottie";
import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWordsOnce } from "../../FIreStore";

// storage utilities
import { getSolvedWords } from "@/utils/storage";

type Level = "Easy" | "medium" | "hard";
export default function Index() {
  const params = useLocalSearchParams();
  const level = params.selectedLevel as Level;
  console.log(level, "levelValue");
  const navigate = useRouter();
  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }
  const handleRestart = async (level: "Easy" | "medium" | "hard") => {
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
        onPress={() => navigate.push("/")}
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
