import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const LottieLeaves = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/d7d28837-a01a-4346-b5c8-b1665f10b084/NcGNUfivEa.lottie",
        }}
        autoPlay
        loop
        speed={0.5}
        style={styles.animation}
      />
    </View>
  );
};
const LottieLeavesTwo = () => {
  return (
    <View style={styles.containerTwo}>
      <LottieView
        source={{
          uri: "https://lottie.host/d7d28837-a01a-4346-b5c8-b1665f10b084/NcGNUfivEa.lottie",
        }}
        autoPlay
        loop
        speed={0.5}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "transparent",
    top: "15%",
    left: 0,
    zIndex: 10,
  },
  animation: {
    width: 300,
    height: 100,
  },
  containerTwo: {
    position: "absolute",
    backgroundColor: "transparent",
    top: "20%",
    left: 100,
    zIndex: 10,
  },
});

export default LottieLeaves;
export { LottieLeavesTwo };
