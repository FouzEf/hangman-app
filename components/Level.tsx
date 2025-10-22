import {
  Nunito_400Regular,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { fetchWordsOnce } from "../FIreStore";

// storage utilities
import { getSolvedWords } from "@/utils/storage";

type Props = {
  setLevelValue: (value: string) => void;
  setLevelVisible: (visible: boolean) => void;
  levelVisible: boolean;
  levelValue: string;
};

const Level = ({
  setLevelVisible,
  setLevelValue,
  levelVisible,
  levelValue,
}: Props) => {
  const navigate = useRouter();
  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
    Nunito_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }

  const handleLevel = async (level: any) => {
    setLevelValue(level);
    setLevelVisible(false);

    const fetched = await fetchWordsOnce(level);
    const solved = await getSolvedWords();
    if (fetched.every((word) => solved.includes(word))) {
      navigate.push({
        pathname: "/winPage",
        params: { selectedLevel: level },
      });
      return;
    }

    if (levelValue) {
      navigate.push({
        pathname: "/gamePage",
        params: { selectedLevel: level },
      });
      return;
    }
  };

  return (
    <Modal transparent animationType="slide" visible={levelVisible}>
      <View style={style.overlay}>
        <TouchableWithoutFeedback>
          <View style={style.container}>
            <Text style={style.title}>Level</Text>

            <Pressable
              onPress={() => handleLevel("Easy")}
              style={({ hovered, pressed }) => [
                style.button,
                style.easy,
                hovered && style.hovered,
                pressed && style.pressed,
              ]}
            >
              <Text style={style.text}>Easy</Text>
            </Pressable>

            <Pressable
              onPress={() => handleLevel("medium")}
              style={({ hovered, pressed }) => [
                style.button,
                style.medium,
                hovered && style.hovered,
                pressed && style.pressed,
              ]}
            >
              <Text style={style.text}>Medium</Text>
            </Pressable>

            <Pressable
              onPress={() => handleLevel("hard")}
              style={({ hovered, pressed }) => [
                style.button,
                style.hard,
                hovered && style.hovered,
                pressed && style.pressed,
              ]}
            >
              <Text style={style.text}>Hard</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const style = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  //modal: {
  //backgroundColor: "white",
  //margin: 20,
  //position: "relative",
  //},
  container: {
    backgroundColor: "white",
    marginHorizontal: 20,
    height: 300,
    width: 300,
    padding: 20,

    borderRadius: 10,
    boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: "20%",
  },
  title: {
    fontSize: 25,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: 800,
    fontFamily: "Nunito_800ExtraBold",
    color: "#504e4eff",
  },
  easy: {
    backgroundColor: "#4CAF50",
    marginTop: 30,
  },
  medium: { backgroundColor: "#FFC107" },
  hard: { backgroundColor: "#F44336" },
  button: {
    marginVertical: 10,
    paddingVertical: 5,
    textAlign: "center",
    color: "#f5f5f5",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 18,
    borderRadius: 10,
    width: 150,
    marginHorizontal: "auto",
    boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
  },
  hovered: {
    transform: [{ scale: 1.05 }],
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Level;
