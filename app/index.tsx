import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Home from "@assets/images/HomeImage.png";
import Cloud from "@components/Cloud";

import Level from "@/components/Level";
import useClickSound from "@/utils/useClickSound";
import HowToPlay from "@components/HowToPLay";

export default function Index() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  //level selection
  const [levelVisible, setLevelVisible] = useState<boolean>(false);
  const [levelValue, setLevelValue] = useState<string>("");
  const playSound = useClickSound();
  const toggleModal = () => {
    playSound();
    setModalVisible(!modalVisible);
  };

  const startGame = () => {
    setLevelVisible(true);
  };
  const playSound = SoundButton();
  const toggleModal = () => {
    playSound();
    setModalVisible(!modalVisible);
  };
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
      <View style={Style.container}>
        <Cloud />
        <Image source={Home} style={Style.img} />
        <Text style={Style.text}>HangMan</Text>
        <TouchableOpacity style={Style.btn} onPress={startGame}>
          <Text style={Style.btnText}>Start Game</Text>
        </TouchableOpacity>
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
    //borderColor: 'black',
    // borderWidth:5
  },
  text: {
    fontFamily: "Nunito_800ExtraBold",
    fontStyle: "normal",
    fontWeight: 800,
    lineHeight: 87,
    textAlign: "center",
    marginTop: 0,
    fontSize: 64,
    color: "#263238",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
  },
  btn: {
    backgroundColor: "#FF6F61",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
    borderRadius: 50,
    width: 150,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    marginTop: 10,
    zIndex: 10,
  },
  btnText: {
    fontFamily: "Nunito",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF",
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
