import { TextInput } from "react-native";
type Props = {
  value: string;
  answer: string;
};
const TextInpt = ({ value, answer }: Props) => {
  const displayValue = value === answer ? value : "";
  return (
    <TextInput value={displayValue} style={{ fontSize: 18 }} editable={false} />
  );
};
export default TextInpt;
