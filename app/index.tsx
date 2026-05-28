import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";

import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import useClickSound from "@/audio/useClickSound";
import AboutModal from "@/components/AboutModal";
import Level from "@/components/Level";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { hasSeenOnboarding } from "@/utils/storage";
import Home from "@assets/images/HomeImage.png";
import AnimatedTitle from "@components/AnimatedTitle";
import Cloud from "@components/Cloud";
import GradientButton from "@components/GradientButton";
import HowToPlay from "@components/HowToPLay";
import { AntDesign } from "@expo/vector-icons";
import HeadphoneButton from "../audio/HeadphoneButton";

export default function Index() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [aboutVisible, setAboutVisible] = useState<boolean>(false);
  const [onboardingVisible, setOnboardingVisible] = useState<boolean>(false);

  // level selection
  const [levelVisible, setLevelVisible] = useState<boolean>(false);
  const [levelValue, setLevelValue] = useState<string>("");

  const playSound = useClickSound();

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      if (!seen) setOnboardingVisible(true);
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const startGame = () => {
    playSound();
    setLevelVisible(true);
  };

  const toggleModal = () => {
    playSound();
    setModalVisible(!modalVisible);
  };

  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[Style.container, { zIndex: 100 }]}
    >
      <View style={Style.container}>
        {/* Top-right controls */}
        <View style={Style.topRight}>
          <HeadphoneButton />
          <TouchableOpacity
            onPress={() => { playSound(); setAboutVisible(true); }}
            style={Style.infoBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AntDesign name="infocirlceo" size={22} color="#263238" />
          </TouchableOpacity>
        </View>

        <Cloud />
        <Image source={Home} style={Style.img} />
        <AnimatedTitle />
        <GradientButton
          title="Start Game"
          onPress={startGame}
        />
        <TouchableOpacity onPress={toggleModal} style={{ zIndex: 10 }}>
          <Text style={Style.btnPlay}>How to Play?</Text>
        </TouchableOpacity>

        {modalVisible && <HowToPlay onClose={toggleModal} modalVisible />}
        {levelVisible && (
          <Level
            levelValue={levelValue}
            levelVisible={levelVisible}
            setLevelValue={setLevelValue}
            setLevelVisible={setLevelVisible}
          />
        )}

        <OnboardingTutorial
          visible={onboardingVisible}
          onDone={() => setOnboardingVisible(false)}
        />

        <AboutModal
          visible={aboutVisible}
          onClose={() => setAboutVisible(false)}
        />
      </View>
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
  img: {
    position: "absolute",
    width: "100%",
    height: "50%",
    resizeMode: "contain",
    top: 80,
    zIndex: 1,
  },
  topRight: {
    position: "absolute",
    top: 40,
    right: 30,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoBtn: {
    opacity: 0.75,
  },
  btnPlay: {
    fontFamily: "Nunito",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    textDecorationLine: "underline",
    color: "#263238",
    marginTop: 10,
  },
});
