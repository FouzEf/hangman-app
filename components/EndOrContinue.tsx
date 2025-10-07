import React from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  modalVisible: boolean;
  onClose: () => void;
  onPlayAgain?: () => void;
  onExit?: () => void;
};

const EndOrContinue = ({ modalVisible, onClose }: Props) => {
  return (
    <Modal transparent animationType="slide" visible={modalVisible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Text>Nice job! Would you like to...</Text>
        </View>
        <View>
          <Pressable onPress={onClose}>
            <Text>Play Again</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text>Exit</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EndOrContinue;
