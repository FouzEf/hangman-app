import { fireEvent, render } from "@testing-library/react-native";
import HowToPlay from "../components/HowToPLay";

// -----------------------------------------------------------------------------
// MOCKS
// -----------------------------------------------------------------------------

// Mock fonts used by HowToPlay.tsx
jest.mock("@expo-google-fonts/nunito", () => ({
  useFonts: () => [true, null],
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
  Nunito_400Regular: "Nunito_400Regular",
}));
// ✅ UPDATE: Mock AntDesign to allow querying the icon by its name
jest.mock("@expo/vector-icons/AntDesign", () => {
  const React = require("react");
  // Returns the name prop as text content so we can query for 'close'
  return ({ name, ...props }: any) => React.createElement("Text", props, name);
});

describe("HowToPlay.tsx - Close Logic", () => {
  it("should call onClose when the close icon is pressed", () => {
    const mockOnClose = jest.fn();
    // Render the component as visible
    const { getByText } = render(
      <HowToPlay modalVisible={true} onClose={mockOnClose} />
    );

    // Find the text content 'close' which is output by the mocked icon
    const closeIconPressable = getByText("close");
    fireEvent.press(closeIconPressable);

    // ✅ ASSERTION: Verify the close handler was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the modal backdrop is pressed", () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <HowToPlay modalVisible={true} onClose={mockOnClose} />
    );

    // Find the backdrop using the required testID
    const backdrop = getByTestId("how-to-play-backdrop");

    // Simulate a press on the backdrop area
    fireEvent.press(backdrop);

    // ✅ ASSERTION: Verify the close handler was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
