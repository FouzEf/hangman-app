import { useState } from "react";
import { StyleSheet, View } from "react-native";
import TextInpt from "./TextInpt";

const Input = () => {
  const [text, setText] = useState<string>("apple");
  const [answer, setAnswer] = useState<string>("a");

  const letters = text.split("");
  return (
    <View style={styles.container}>
      {letters.map((letter, index) => {
        return (
          <View
            key={index}
            style={{
              display: "flex",
              borderBottomColor: letter === answer ? "green" : "black",
              borderBottomWidth: 2,
            }}
          >
            <TextInpt value={letter} answer={answer} />
          </View>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "80%",
    justifyContent: "space-between",
  },
  inpt: {
    fontSize: 18,
    //fontWeight: "bold",
  },
});
export default Input;
