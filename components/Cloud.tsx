import cloudImg from "@assets/images/Cloud.png";
import InvertedCloud from "@assets/images/InvertedCloud.png";
import SunWithCloud from "@assets/images/SunWithCloud.png";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

const Cloud = () => {
  const cloud1X = useRef(new Animated.Value(0)).current;
  const cloud2X = useRef(new Animated.Value(0)).current;
  const cloud3X = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("useEffect called");
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
    top: "-45%",
    left: "10%",
    height: "100%",
    width: "70%",
    resizeMode: "contain",
  },
  cloud1: {
    position: "absolute",
    height: "100%",
    width: "35%",
    right: "0%",
    top: "-28%",
    resizeMode: "contain",
  },
  cloud2: {
    position: "absolute",
    height: "100%",
    width: "40%",
    left: "0%",
    top: "-28%",
    resizeMode: "contain",
  },
  cloud3: {
    position: "absolute",
    height: "100%",
    width: "35%",
    left: "40%",
    top: "-10%",
    resizeMode: "contain",
  },
  container: {
    position: "relative",
    width: "100%",
    height: "50%",
    marginTop: "-30%",
  },
});

export default Cloud;
