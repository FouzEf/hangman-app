import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";


const Cloud = () => {
    const cloudImg: any = require('./assets/images/cloudImg.png');
    const InvertedCloud: any = require('./assets/images/invertedCloud.png');
    const SunWithCloud: any = require('./assets/images/SunWithCloud.png');

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
    
    return (<view style={Style.container}>
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
    </view>)
}

const Style = StyleSheet.create({
     sun: {
    position: "absolute",
    top: "-40%",
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
    top: "-20%",
    resizeMode: "contain",
    },
    container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
        width: "100%",
  },
})

export default Cloud;