import grass1 from "@assets/images/grass1.png";
import grass2 from "@assets/images/grass2.png";
import grass3 from "@assets/images/grass3.png";
import { Image, StyleSheet, View } from "react-native";

const Grass = () => {
  return (
    <View style={{ width: "100%" }}>
      <View style={styles.line}></View>
      <Image source={grass1} style={{ width: 50, height: 50 }} />
      <Image source={grass2} style={{ width: 50, height: 50 }} />
      <Image source={grass3} style={{ width: 50, height: 50 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "black",
    position: "absolute",
    top: -50,
  },
});
export default Grass;
