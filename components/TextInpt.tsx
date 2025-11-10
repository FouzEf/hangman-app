import { TextInput, View } from "react-native";

type Props = {
  value: string;
  displayValue: string;
  onGuess: (guess: string) => void;
  currentGuess: string;
  setCurrentGuess: (text: string) => void;
};

const TextInpt = ({
  displayValue,
  onGuess,
  currentGuess,
  setCurrentGuess,
}: Props) => {
  // const inputRef = useRef<TextInput>(null);
  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, [displayValue]);
  if (displayValue !== "") {
    return (
      <TextInput
        value={displayValue}
        style={{
          fontSize: 18,
          textAlign: "center",
          color: "green",
          fontWeight: "bold",
        }}
        editable={false}
      />
    );
  }

  // If the letter is NOT solved, show the editable input field
  return (
    <View testID="letter-slot">
      <TextInput
        // ref={inputRef}
        value={currentGuess}
        onChangeText={(text) => {
          const newText = text.slice(-1).toLowerCase();
          setCurrentGuess(newText);
          if (newText.length === 1) {
            onGuess(newText);
          }
        }}
        style={{ fontSize: 18, textAlign: "center" }}
        maxLength={1}
        autoCapitalize="none"
        keyboardType="default"
      />
    </View>
  );
};
export default TextInpt;
