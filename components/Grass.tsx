import gallow from "@assets/images/gallow.png";
import grass3 from "@assets/images/grass3.png";
import { Image, StyleSheet, View } from "react-native";

const Grass = () => {
  console.log("Grass rendered");
  return (
    <View style={{ width: "100%" }}>
      <Image source={grass3} style={[styles.grass, { left: -80 }]} />
      <Image source={grass3} style={[styles.grass, { left: 80 }]} />
      <Image source={gallow} style={styles.gallow} />
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
    height: 180,
    resizeMode: "contain",
    position: "absolute",
    top: -230,
  },
});
export default Grass;
