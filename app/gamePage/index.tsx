import CloudGamePage from "@/components/CloudGamePage";
import Grass from "@/components/Grass";
import Input from "@/components/Input";
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
        <CloudGamePage />
        <Grass />
        <Input />
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
