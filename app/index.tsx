import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from "react-native";


export default function Index() {
  return (
    <LinearGradient
      colors={['#80C2F3', '#C8E6C9']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={Style.container}
    >

    <View style={Style.container}>
      <Text>Hello</Text>
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
    backgroundImage: 'linear-gradient(180deg, #80C2F3 0%, #C8E6C9 100%)'
  }
})

