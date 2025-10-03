import gallow from "@assets/images/gallow.png";
import grass3 from "@assets/images/grass3.png";
import Stage1 from "@assets/images/Stage1.png";
import Stage2 from "@assets/images/Stage2.png";
import Stage3 from "@assets/images/Stage3.png";
import Stage4 from "@assets/images/Stage4.png";
import Stage5 from "@assets/images/Stage5.png";
import Stage6 from "@assets/images/Stage6.png";
import { Image, StyleSheet, View } from "react-native";
type Props = {
  wrongGuesses: string[];
};
const Grass = ({ wrongGuesses }: Props) => {
  return (
    <View style={{ width: "100%" }}>
      <Image source={grass3} style={[styles.grass, { left: -80 }]} />
      <Image source={grass3} style={[styles.grass, { left: 80 }]} />
      <Image source={gallow} style={styles.gallow} />
      {wrongGuesses.length === 1 && (
        <Image source={Stage1} style={styles.image} />
      )}
      {wrongGuesses.length === 2 && (
        <Image source={Stage2} style={styles.imageStage2} />
      )}
      {wrongGuesses.length === 3 && (
        <Image source={Stage3} style={styles.imageStage2} />
      )}
      {wrongGuesses.length === 4 && (
        <Image source={Stage4} style={styles.imageStage2} />
      )}
      {wrongGuesses.length === 5 && (
        <Image source={Stage5} style={styles.imageStage3} />
      )}
      {wrongGuesses.length === 6 && (
        <Image source={Stage6} style={styles.imageStage3} />
      )}
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
    height: 250,
    resizeMode: "contain",
    position: "absolute",
    top: -300,
  },
  image: {
    height: 50,
    resizeMode: "contain",
    position: "absolute",
    top: -245,
    left: 165,
  },
  imageStage2: {
    height: 120,
    resizeMode: "contain",
    position: "absolute",
    top: -245,
    left: 148,
  },
  imageStage3: {
    height: 150,
    resizeMode: "contain",
    position: "absolute",
    top: -245,
    left: 148,
  },
});
export default Grass;
