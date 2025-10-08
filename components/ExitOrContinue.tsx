import React, { JSX, useEffect } from "react";

import AntDesign from "@expo/vector-icons/AntDesign";

import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  onModalClose: () => void;
  modalVisible: boolean;
  onExit: () => void;
  onContinue: () => void;
};

const ExitOrContinue = ({
  onModalClose,
  modalVisible,
  onExit,
  onContinue,
}: Props): JSX.Element => {
  useEffect(() => {
    const onBackPress = () => {
      if (modalVisible) {
        onModalClose();
        return true; // handle the bck press
      }
      return false; // default behavior
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [modalVisible]);

  return (
    <Modal
      visible={modalVisible}
      style={styles.modal}
      transparent
      animationType="slide"
      onRequestClose={onModalClose}
    >
      {/* Backdrop behind the card 
      <Pressable style={styles.backdrop} onPress={onModalClose} />*/}

      {/* Card centered above backdrop */}
      <View style={styles.card}>
        <Pressable onPress={onModalClose} style={styles.closeIconHit}>
          <AntDesign name="close" size={16} color="black" />
        </Pressable>

        <Text style={styles.emoji}>😢</Text>
        <Text style={styles.message}>Do you really want to leave?</Text>
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={onContinue}
          >
            <Text style={styles.btnTextSecondary}>Continue</Text>
          </Pressable>
          {/*<Pressable onModalVisible={onModalClose}></Pressable>*/}
          <Pressable style={styles.backdrop} onPress={onModalClose} />

          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Exit app"
          >
            <Text style={styles.btnTextPrimary}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  emoji: {
    fontSize: 56,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 110,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#111",
  },
  btnSecondary: {
    backgroundColor: "#eee",
  },
  btnTextPrimary: {
    color: "white",
    fontWeight: "600",
  },
  btnTextSecondary: {
    color: "#111",
    fontWeight: "600",
  },
  closeIconHit: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 12,
  },
  card: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "35%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});

export default ExitOrContinue;

//logic: needs to "intercept" leaving attemps and trigger the modal pop up
