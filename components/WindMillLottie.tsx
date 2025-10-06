import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const WindMillLottie = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/72fc9fef-e715-46a4-b4cd-51a91220af26/IBul1azdJK.lottie",
        }}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const WindMillLottieTwo = () => {
  return (
    <View style={styles.containerTwo}>
      <LottieView
        source={{
          uri: "https://lottie.host/72fc9fef-e715-46a4-b4cd-51a91220af26/IBul1azdJK.lottie",
        }}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "15%",
    left: -10,
  },
  animation: {
    width: 150,
    height: 150,
  },
  containerTwo: {
    backgroundColor: "transparent",
    position: "absolute",
    top: "18%",
    left: 50,
  },
});

export default WindMillLottie;
export { WindMillLottieTwo };
