import Cloud from "@/components/Cloud";
import Gallow from "@/components/Gallow";
import Grass from "@/components/Grass";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

const gamePage = () => {
  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >
      <View style={Style.container}>
        <Cloud />
        <Gallow />
        <Grass />
      </View>
    </LinearGradient>
  );
};

const Style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
});
export default gamePage;
