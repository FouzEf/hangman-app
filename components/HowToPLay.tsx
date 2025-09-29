import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";

{
  /*type Props = {
  visible: boolean;
  onClose: () => void;
}; 
*/
}

const HowToPlayModal = () => {
  return (
    <Modal
      style={styles.modal}
      //visible={visible}
      transparent
      animationType="slide"
      //onRequestClose={onClose}
    >
      <View style={styles.container}>
        <AntDesign
          name="close"
          style={styles.closeIcon}
          size={15}
          color="black"
        />
        <Text style={styles.title}>
          Hey, it&#39;s <Text style={{ fontWeight: "bold" }}>Hangman!</Text>{" "}
          Your favourite all-time classic game.
        </Text>
        <Text
          style={{
            fontSize: 15,
            marginBottom: 5,
            textDecorationLine: "underline",
          }}
        >
          How to play:
        </Text>
        <FlatList
          data={[
            {
              key: " The App picks a secret word and draws blank spaces for each letter.",
            },
            { key: "The player guesses letters, one at a time." },
            {
              key: "If the letter is in the word, it is placed in the right spot(s).",
            },
            {
              key: "If the letter is not in the word, add a piece to the stick figure (head, body, arms, legs, etc.).",
            },
            { key: " Keep guessing until: " },
          ]}
          renderItem={({ item, index }) => (
            <Text style={styles.item}>
              {index + 1}.{item.key}
            </Text>
          )}
        />
        <FlatList
          data={[
            { key: "You figure out the whole word (you win), or" },
            { key: "The stick figure is fully drawn (you lose)." },
          ]}
          renderItem={({ item }: { item: { key: string } }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <View style={styles.dot} />
              <Text style={styles.item2}>{item.key}</Text>
            </View>
          )}
        />
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          It’s a race between your brain and the hangman’s noose guess smart, or
          swing!
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    margin: 20,
    position: "relative",
  },
  container: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: "10%",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 8,
  },
  title: {
    fontSize: 15,
    marginBottom: 10,
  },
  item: {
    marginBottom: 5,
  },
  dot: {
    width: 5,
    height: 5,
    backgroundColor: "black",
    borderRadius: 50,
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
  },
  item2: {
    marginBottom: 5,
    textAlignVertical: "center",
  },
});

export default HowToPlayModal;
