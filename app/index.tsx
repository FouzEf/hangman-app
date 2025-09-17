import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, View } from "react-native";
import Cloud from "../assets/images/Cloud.png";
import Home from "../assets/images/HomeImage.png";
import InvertedCloud from "../assets/images/InvertedCloud.png";
import SunWithCloud from "../assets/images/SunWithCloud.png";

export default function Index() {
  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >
      <View style={Style.container}>
        <Image source={SunWithCloud} style={Style.sun} />
        <Image source={Cloud} style={Style.cloud1} />
        <Image source={InvertedCloud} style={Style.cloud2} />
        <Image source={InvertedCloud} style={Style.cloud3} />
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
    width: 300,
    height: 200,
  },
  sun: {
    position: "absolute",
    top: -30,
    height: 170,
    width: 170,
  },
  cloud1: {
    position: "absolute",
    height: 80,
    width: 80,
    right: 0,
    top: 100,
  },
  cloud2: {
    position: "absolute",
    height: 80,
    width: 80,
    left: 0,
    top: 70,
  },
  cloud3: {
    position: "absolute",
    height: 80,
    width: 80,
    left: 80,
    top: 125,
  },
});
