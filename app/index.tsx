import Cloud from "@/assets/images/Cloud.png";
import Home from "@/assets/images/HomeImage.png";
import InvertedCloud from "@/assets/images/InvertedCloud.png";
import SunWithCloud from "@/assets/images/SunWithCloud.png";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, View } from "react-native";

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
