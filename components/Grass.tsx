import grass1 from "@assets/images/grass1.png";
import grass2 from "@assets/images/grass2.png";
import grass3 from "@assets/images/grass3.png";
import { Image, StyleSheet, View } from "react-native";

const Grass = () => {
  console.log("Grass rendered");
  return (
    <View style={{ width: "100%" }}>
      <Image source={grass1} style={{ width: 50, height: 50 }} />
      <Image source={grass2} style={{ width: 50, height: 50 }} />
      <Image source={grass3} style={{ width: 50, height: 50 }} />
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
    width: 50,
    height: 50,
    marginHorizontal: 2,
    resizeMode: "contain",
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "black",
    position: "absolute",
    top: -50,
  },
});
export default Grass;
