import {
    Nunito_400Regular,
    Nunito_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/nunito";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { fetchWordsOnce } from "../WordService";

// storage utilities
import useClickSound from "@/audio/useClickSound";
import { getSolvedWords } from "@/utils/storage";
import GradientButton from "./GradientButton";

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
  const playSound = useClickSound();
  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
    Nunito_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLevel = async (level: "Easy" | "medium" | "hard" | "Test") => {
    playSound();
    setLevelValue(level);
    setLevelVisible(false);

    const fetched: string[] = await fetchWordsOnce(level);
    const solved = await getSolvedWords();
    // console.log("clicked");
    // console.log(fetched, solved);
    if (fetched.every((word) => solved.includes(word))) {
      navigate.push({
        pathname: "/winPage",
        params: { selectedLevel: level },
      });
      return;
    }
    navigate.push({
      pathname: "/gamePage",
      params: { selectedLevel: level },
    });
  };

  const closeModal = () => {
    playSound();
    setLevelVisible(false);
  };

  return (
    <Modal transparent animationType="fade" visible={levelVisible} onRequestClose={closeModal}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={style.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              entering={FadeInUp.springify().damping(12)}
              exiting={FadeOutDown}
              style={style.container}
            >
              <Text style={style.title}>Select Level</Text>

              <View style={style.buttonContainer}>
                 <GradientButton
                    title="Easy"
                    onPress={() => handleLevel("Easy")}
                    colors={["#4CAF50", "#8BC34A"]}
                    containerStyle={style.buttonWrapper}
                 />
                 
                 <GradientButton
                    title="Medium"
                    onPress={() => handleLevel("medium")}
                    colors={["#FF9800", "#FFC107"]}
                    containerStyle={style.buttonWrapper}
                 />
                 
                 <GradientButton
                    title="Hard"
                    onPress={() => handleLevel("hard")}
                    colors={["#F44336", "#FF5252"]}
                    containerStyle={style.buttonWrapper}
                 />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const style = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#ffffff",
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 10,
  },
  title: {
    fontSize: 32,
    marginBottom: 25,
    textAlign: "center",
    fontFamily: "Nunito_800ExtraBold",
    color: "#263238",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  buttonWrapper: {
    width: '80%',
    marginVertical: 5,
  }
});

export default Level;
