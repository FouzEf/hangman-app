import ContinueImage from "@assets/images/continue.png";
import HomeModal from "@assets/images/HomeModal.png";
import Retry from "@assets/images/retry.png";
import { useEffect } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { soundManager } from "../audio/SoundManager";

type Props = {
  modalVisible: boolean;
  wrongGuesses: string[];
  toHome: () => void;
  continueOrRetry: () => void;
  secretWord: string;
};

const WinOrLose = ({
  modalVisible,
  wrongGuesses,
  toHome,
  continueOrRetry,
  secretWord,
}: Props) => {
  // Play once when the modal opens, using global sound manager
  useEffect(() => {
    if (!modalVisible) return;
    if (wrongGuesses.length >= 6) {
      soundManager.play("failLevel");
    } else {
      soundManager.play("winLevel");
    }
  }, [modalVisible, wrongGuesses.length]);

  const lost = wrongGuesses.length >= 6;

  return (
    <Modal transparent animationType="slide" visible={modalVisible}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.container,
              {
                backgroundColor: lost ? "#CFD8DC" : "#f8f4c8",
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: lost ? "#333" : "#388E3C",
                },
              ]}
            >
              {lost ? `Oopps! You've Lost 😢` : "Good Job !"}
            </Text>
            <Pressable onPress={continueOrRetry}>
              {lost ? (
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
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.5)",
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    position: "absolute",
    bottom: "0%",
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
