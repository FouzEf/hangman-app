import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const WinLottie = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/dedbe794-71e2-45f6-ada9-525876d6147f/BudOAT2A81.lottie",
        }}
        loop
        speed={1}
        style={styles.animation}
        autoPlay
      />
    </View>
  );
};

const WinCup = () => {
  return (
    <View style={styles.wincupcontainer}>
      <LottieView
        source={{
          uri: "https://lottie.host/056b34e3-4d8d-4d8d-8f11-dc58f2f4d6ad/7LEx3ZGVcw.lottie",
        }}
        loop
        speed={0.7}
        style={styles.wincupanimation}
        autoPlay
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "0%",
  },
  animation: {
    width: 500,
    height: 500,
    backgroundColor: "transparent", // ensures animation view is transparent
  },
  wincupcontainer: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "5%",
  },
  wincupanimation: {
    width: 300,
    height: 300,
    backgroundColor: "transparent", // ensures animation view is transparent
  },
});

export default WinLottie;
export { WinCup };
