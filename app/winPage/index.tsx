import WinLottie, { WinCup } from "@components/WinLottie";
import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Index() {
  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[Style.container, { zIndex: 100 }]}
    >
      <Text style={Style.text}>
        Yaay! You&apos;ve completed the <Text style={Style.level}>easy</Text>{" "}
        level
      </Text>
      <WinLottie />
      <WinCup />
      <Pressable style={[Style.buttonRestart, Style.button]}>
        <Text style={Style.buttonText}>Restart Level</Text>
      </Pressable>
      <Pressable style={[Style.buttonHome, Style.button]}>
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
