import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const BirdLottie = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/bee877ff-946e-4288-b6de-5e75ef8d6f2c/5MPLR1oaz6.lottie",
        }}
        autoPlay
        loop
        speed={1}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "-50%",
  },
  animation: {
    width: 500,
    height: 500,
    backgroundColor: "transparent", // ensures animation view is transparent
  },
});

export default BirdLottie;
