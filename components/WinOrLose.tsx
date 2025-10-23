import ContinueImage from "@assets/images/continue.png";
import HomeModal from "@assets/images/HomeModal.png";
import Retry from "@assets/images/retry.png";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
type Props = {
  modalVisible: boolean;
  wrongGuesses: string[];
  toHome: () => void;
  continueOrRetry: () => void;
};

const WinOrLose = ({
  modalVisible,
  wrongGuesses,
  toHome,
  continueOrRetry,
}: Props) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const playWinSound = async () => {
      if (modalVisible && wrongGuesses.length <= 6) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/winLevel.mp3")
          );
          soundRef.current = sound;
          await sound.playAsync(); // And here
        } catch (error) {
          console.error("Sound playback failed:", error);
        }
      } else if (modalVisible && wrongGuesses.length >= 6) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/failLevel.mp3")
          );
          soundRef.current = sound;
          await sound.playAsync(); // And here
        } catch (error) {
          console.error("Sound playback failed:", error);
        }
      }
    };

    playWinSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [modalVisible, wrongGuesses]);

  return (
    <Modal transparent animationType="slide" visible={modalVisible}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.container,
              {
                backgroundColor:
                  wrongGuesses.length >= 6 ? "#CFD8DC" : "#f8f4c8",
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: wrongGuesses.length >= 6 ? "#333" : "#388E3C",
                },
              ]}
            >
              {wrongGuesses.length >= 6
                ? `Oopps! You've Lost 😢`
                : "Good Job !"}
            </Text>
            <Pressable onPress={continueOrRetry}>
              {wrongGuesses.length >= 6 ? (
                <Image source={Retry} style={styles.continueImage} />
              ) : (
                <Image source={ContinueImage} style={styles.continueImage} />
              )}
            </Pressable>
            <Pressable onPress={toHome}>
              <Image source={HomeModal} style={styles.HomeImage} />
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    //backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: "0%",
    width: "100%",
    height: "40%",
  },
  text: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
  },
  continueImage: {
    height: 80,
    width: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 20,
    boxShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    borderRadius: 50,
    backgroundColor: "white",
  },
  HomeImage: {
    height: 80,
    width: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 30,
    boxShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    borderRadius: 50,
    backgroundColor: "white",
  },
});

export default WinOrLose;
