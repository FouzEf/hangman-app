import cloudImg from "@assets/images/Cloud.png";
import InvertedCloud from "@assets/images/InvertedCloud.png";
import SunWithCloud from "@assets/images/SunWithCloud.png";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

const CloudGamePage = () => {
  const cloud1X = useRef(new Animated.Value(0)).current;
  const cloud2X = useRef(new Animated.Value(0)).current;
  const cloud3X = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateCloud = (
      cloudAnim: Animated.Value | Animated.ValueXY,
      toValue: number,
      duration: number
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloudAnim, {
            toValue,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(cloudAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateCloud(cloud1X, 50, 6000);
    animateCloud(cloud2X, -40, 8000);
    animateCloud(cloud3X, 30, 7000);
  }, [cloud1X, cloud2X, cloud3X]);

  return (
    <View style={Style.container}>
      <Image source={SunWithCloud} style={Style.sun} />
      <Animated.Image
        source={cloudImg}
        style={[Style.cloud1, { transform: [{ translateX: cloud1X }] }]}
      />
      <Animated.Image
        source={InvertedCloud}
        style={[Style.cloud2, { transform: [{ translateX: cloud2X }] }]}
      />
      <Animated.Image
        source={InvertedCloud}
        style={[Style.cloud3, { transform: [{ translateX: cloud3X }] }]}
      />
    </View>
  );
};

const Style = StyleSheet.create({
  sun: {
    position: "absolute",
    top: -150,
    left: "50%",
    height: "100%",
    width: 150,
    resizeMode: "contain",
  },
  cloud1: {
    position: "absolute",
    height: "100%",
    width: "20%",
    right: "10%",
    top: -80,
    resizeMode: "contain",
  },
  cloud2: {
    position: "absolute",
    height: "100%",
    width: "20%",
    left: "10%",
    top: -120,
    resizeMode: "contain",
  },
  cloud3: {
    position: "absolute",
    height: "100%",
    width: "32%",
    left: "40%",
    top: -60,
    resizeMode: "contain",
  },
  container: {
    position: "relative",
    width: "100%",
    height: 250,
    marginTop: 0,
  },
});

export default CloudGamePage;
