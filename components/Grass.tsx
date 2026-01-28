
import gallow from "@assets/images/gallow.png";
import grass3 from "@assets/images/grass3.png";
import Stage1Img from "@assets/images/Stage1.png";
import Stage2Img from "@assets/images/Stage2.png";
import Stage3Img from "@assets/images/Stage3.png";
import Stage4Img from "@assets/images/Stage4.png";
import Stage5Img from "@assets/images/Stage5.png";
import Stage6Img from "@assets/images/Stage6.png";
import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Props = {
  wrongGuesses: string[];
};

// Reanimated components
const AnimatedImage = Animated.createAnimatedComponent(Image);


const Grass = ({ wrongGuesses }: Props) => {


  // Shared values for each stage hanging animation
  const swing1 = useSharedValue(0);
  const swing2 = useSharedValue(0);
  const swing3 = useSharedValue(0);
  const swing4 = useSharedValue(0);
  const swing5 = useSharedValue(0);
  const swing6 = useSharedValue(0);

  useEffect(() => {
    const startSwing = (sv: SharedValue<number>, index: number) => {
        setTimeout(() => {
             sv.value = withRepeat(
                withSequence(
                    withTiming(2, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(-2, { duration: 2500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
             );
        }, index * 200);
    };

    if (wrongGuesses.length >= 1) startSwing(swing1, 1);
    if (wrongGuesses.length >= 2) startSwing(swing2, 2);
    if (wrongGuesses.length >= 3) startSwing(swing3, 3);
    if (wrongGuesses.length >= 4) startSwing(swing4, 4);
    if (wrongGuesses.length >= 5) startSwing(swing5, 5);
    if (wrongGuesses.length >= 6) startSwing(swing6, 6);

  }, [wrongGuesses.length]);

  const style1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing1.value },
      { rotate: `${swing1.value * 0.5}deg` }
    ]
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing2.value },
      { rotate: `${swing2.value * 0.5}deg` }
    ]
  }));
  const style3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing3.value },
      { rotate: `${swing3.value * 0.5}deg` }
    ]
  }));
  const style4 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing4.value },
      { rotate: `${swing4.value * 0.5}deg` }
    ]
  }));
  const style5 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing5.value },
      { rotate: `${swing5.value * 0.5}deg` }
    ]
  }));
  const style6 = useAnimatedStyle(() => ({
    transform: [
      { translateX: swing6.value },
      { rotate: `${swing6.value * 0.5}deg` }
    ]
  }));

  return (
    <View style={{ width: "100%" }}>

      
      {/* Grass Layers */}
      <Image source={grass3} style={[styles.grass, { left: -80, opacity: 0.9 }]} />
      <Image source={grass3} style={[styles.grass, { left: 80, opacity: 1 }]} />
      
      <Image source={gallow} style={styles.gallow} />

      {wrongGuesses.length === 1 && <AnimatedImage source={Stage1Img} style={[styles.image, style1]} />}
      {wrongGuesses.length === 2 && <AnimatedImage source={Stage2Img} style={[styles.imageStage2, style2]} />}
      {wrongGuesses.length === 3 && <AnimatedImage source={Stage3Img} style={[styles.imageStage2, style3]} />}
      {wrongGuesses.length === 4 && <AnimatedImage source={Stage4Img} style={[styles.imageStage2, style4]} />}
      {wrongGuesses.length === 5 && <AnimatedImage source={Stage5Img} style={[styles.imageStage3, style5]} />}
      {wrongGuesses.length === 6 && <AnimatedImage source={Stage6Img} style={[styles.imageStage3, style6]} />}

      <View style={styles.line}></View>
    </View>
  );
};

const styles = StyleSheet.create({

  grass: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: -100,
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.1)",
    position: "absolute",
    top: -20,
  },
  gallow: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    position: "absolute",
    top: -270,
    zIndex: 10,
  },
  image: {
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: -250,
    left: "40%",
    zIndex: 0,
  },
  imageStage2: {
    height: 140,
    resizeMode: "contain",
    position: "absolute",
    top: -250,
    left: "34%",
  },
  imageStage3: {
    height: 160,
    resizeMode: "contain",
    position: "absolute",
    top: -250,
    left: "34%",
  },
});

export default Grass;
