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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "-20%",
  },
  animation: {
    width: 500,
    height: 500,
    backgroundColor: "transparent", // ensures animation view is transparent
  },
});

export default WinLottie;
