import gallow from "@assets/images/gallow.png";
import grass3 from "@assets/images/grass3.png";
import Stage1Img from "@assets/images/Stage1.png";
import Stage2Img from "@assets/images/Stage2.png";
import Stage3Img from "@assets/images/Stage3.png";
import Stage4Img from "@assets/images/Stage4.png";
import Stage5Img from "@assets/images/Stage5.png";
import Stage6Img from "@assets/images/Stage6.png";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

type Props = {
  wrongGuesses: string[];
};

const Grass = ({ wrongGuesses }: Props) => {
  const Stage1 = useRef(new Animated.Value(0)).current;
  const Stage2 = useRef(new Animated.Value(0)).current;
  const Stage3 = useRef(new Animated.Value(0)).current;
  const Stage4 = useRef(new Animated.Value(0)).current;
  const Stage5 = useRef(new Animated.Value(0)).current;
  const Stage6 = useRef(new Animated.Value(0)).current;

  const rotate1 = useRef(
    Stage1.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-5deg", "5deg"],
    })
  ).current;
  const rotate2 = useRef(
    Stage2.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-6deg", "6deg"],
    })
  ).current;
  const rotate3 = useRef(
    Stage3.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-7deg", "7deg"],
    })
  ).current;
  const rotate4 = useRef(
    Stage4.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-5deg", "5deg"],
    })
  ).current;
  const rotate5 = useRef(
    Stage5.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-6deg", "6deg"],
    })
  ).current;
  const rotate6 = useRef(
    Stage6.interpolate({
      inputRange: [-2, 2],
      outputRange: ["-4deg", "4deg"],
    })
  ).current;

  useEffect(() => {
    const oscillatePendulum = (
      anim: Animated.Value,
      distance: number,
      duration: number
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: distance,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -distance,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    oscillatePendulum(Stage1, 5, 3000);
    oscillatePendulum(Stage2, 3, 3000);
    oscillatePendulum(Stage3, 3, 3000);
    oscillatePendulum(Stage4, 3, 3000);
    oscillatePendulum(Stage5, 3, 3000);
    oscillatePendulum(Stage6, 3, 3000);
  }, [Stage1, Stage2, Stage3, Stage4, Stage5, Stage6]);

  return (
    <View style={{ width: "100%" }}>
      <Image source={grass3} style={[styles.grass, { left: -80 }]} />
      <Image source={grass3} style={[styles.grass, { left: 80 }]} />
      <Image source={gallow} style={styles.gallow} />

      {wrongGuesses.length === 1 && (
        <Animated.Image
          source={Stage1Img}
          style={[
            styles.image,
            {
              transform: [{ translateX: Stage1 }, { rotate: rotate1 }],
            },
          ]}
        />
      )}
      {wrongGuesses.length === 2 && (
        <Animated.Image
          source={Stage2Img}
          style={[
            styles.imageStage2,
            {
              transform: [{ translateX: Stage2 }, { rotate: rotate2 }],
            },
          ]}
        />
      )}
      {wrongGuesses.length === 3 && (
        <Animated.Image
          source={Stage3Img}
          style={[
            styles.imageStage2,
            {
              transform: [{ translateX: Stage3 }, { rotate: rotate3 }],
            },
          ]}
        />
      )}
      {wrongGuesses.length === 4 && (
        <Animated.Image
          source={Stage4Img}
          style={[
            styles.imageStage2,
            {
              transform: [{ translateX: Stage4 }, { rotate: rotate4 }],
            },
          ]}
        />
      )}
      {wrongGuesses.length === 5 && (
        <Animated.Image
          source={Stage5Img}
          style={[
            styles.imageStage3,
            {
              transform: [{ translateX: Stage5 }, { rotate: rotate5 }],
            },
          ]}
        />
      )}
      {wrongGuesses.length === 6 && (
        <Animated.Image
          source={Stage6Img}
          style={[
            styles.imageStage3,
            {
              transform: [{ translateX: Stage6 }, { rotate: rotate6 }],
            },
          ]}
        />
      )}

      <View style={styles.line}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 56,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: "100%",
  },
  grass: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: -130,
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "black",
    position: "absolute",
    top: -50,
  },
  gallow: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    position: "absolute",
    top: -300,
  },
  image: {
    height: 50,
    resizeMode: "contain",
    position: "absolute",
    top: -245,
    left: 165,
  },
  imageStage2: {
    height: 120,
    resizeMode: "contain",
    position: "absolute",
    top: -245,
    left: 145,
  },
  imageStage3: {
    height: 150,
    resizeMode: "contain",
    position: "absolute",
    top: -250,
    left: 145,
  },
});

export default Grass;
