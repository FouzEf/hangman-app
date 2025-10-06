import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const LottieLeavesTwo = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/d7d28837-a01a-4346-b5c8-b1665f10b084/NcGNUfivEa.lottie",
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
    position: "absolute",
    backgroundColor: "transparent",
    top: 230,
    left: 100,
    zIndex: 10,
  },
  animation: {
    width: 300,
    height: 100,
  },
});

export default LottieLeavesTwo;
