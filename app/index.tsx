import Cloud from "@/assets/images/Cloud.png";
import Home from "@/assets/images/HomeImage.png";
import InvertedCloud from "@/assets/images/InvertedCloud.png";
import SunWithCloud from "@/assets/images/SunWithCloud.png";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

export default function Index() {
  const cloud1X = useRef(new Animated.Value(0)).current;
const cloud2X = useRef(new Animated.Value(0)).current;
  const cloud3X = useRef(new Animated.Value(0)).current;

    useEffect(() => {
  const animateCloud = (cloudAnim: Animated.Value | Animated.ValueXY, toValue: number, duration: number) => {
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
      }
      animateCloud(cloud1X, 50, 6000);
  animateCloud(cloud2X, -40, 8000);
  animateCloud(cloud3X, 30, 7000);
    }, [cloud1X, cloud2X, cloud3X]);
  
  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >
      <View style={Style.container}>
        <Image source={SunWithCloud} style={Style.sun} />
        <Animated.Image source={Cloud} style={[Style.cloud1,  { transform: [{ translateX: cloud1X }] }]} />
        <Animated.Image source={InvertedCloud} style={[Style.cloud2,  { transform: [{ translateX: cloud2X }] }]} />
        <Animated.Image source={InvertedCloud} style={[Style.cloud3,{ transform: [{ translateX : cloud3X }] }]} />
        <Image source={Home} style={Style.img} />
      </View>
    </LinearGradient>
  );
}

const Style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
    width: '100%'
  },
  img: {
    position: "absolute",
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    top: '-10%',
    zIndex: 1
  },
  sun: {
    position: "absolute",
    top: '-40%',
    height: '100%',
    width: '70%',
    objectFit: 'contain'
  },
  cloud1: {
    position: "absolute",
    height: '100%',
    width: '35%',
    right: '0%',
    top: '-28%',
    objectFit: 'contain'
  },
  cloud2: {
    position: "absolute",
    height: '100%',
    width: '40%',
    left: '0%',
    top: '-28%',
    objectFit: 'contain'
  },
  cloud3: {
    position: "absolute",
    height: '100%',
    width: '35%',
    left: '40%',
    top: '-20%',
    objectFit: 'contain'
  },
});
