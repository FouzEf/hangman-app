import { StyleSheet, TextInput, View } from "react-native";

const Input = () => {
  const word = "apple";
  const letters = word.split("");
  return (
    <View style={styles.container}>
      {letters.map((letter, index) => {
        return (
          <View
            key={index}
            style={{
              display: "flex",
              borderBottomColor: "green",
              borderBottomWidth: 2,
            }}
          >
            <TextInput value={letter} style={styles.inpt} />
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
