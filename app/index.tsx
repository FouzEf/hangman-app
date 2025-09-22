import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import Cloud from "@/components/Cloud";
import { useRouter } from "expo-router";

export default function Index() {

  const Home: any = require('./assets/images/HomeImage.png');

  const navigate = useRouter();

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#80C2F3", "#C8E6C9"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >
      <View style={Style.container}>
        <Cloud/>
        <Image source={Home} style={Style.img} />
        <Text style={Style.text}>HangMan</Text>
        <TouchableOpacity
          style={Style.btn}
          onPress={() => navigate.push('/gamePage')}
        >
          <Text style={Style.btnText}>Start Game</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={Style.btnPlay}>How to Play?</Text>
        </TouchableOpacity>
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
    width: "100%",
  },
  img: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    top: "-10%",
    zIndex: 1,
  },
  text: {
    fontFamily: "Nunito_800ExtraBold",
    fontStyle: "normal",
    fontWeight: 800,
    lineHeight: 87,
    textAlign: "center",
    marginTop: 160,
    fontSize: 64,
    color: "#263238",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
  },
  btn: {
    backgroundColor: "#FF6F61",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
    borderRadius: 50,
    width: 150,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    marginTop: 10,
    zIndex: 10,
  },
  btnText: {
    fontFamily: "Nunito",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF",
  },
  btnPlay: {
    fontFamily: "Nunito",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    textDecorationLine: "underline",
    color: "#263238",
    marginTop: 10,
  },
});
