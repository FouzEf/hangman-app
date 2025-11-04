import renderer from "react-test-renderer";
import Cloud from "../components/Cloud"; // Assuming Cloud.tsx is in ../components

// -----------------------------------------------------------------------------
// MOCKS
// -----------------------------------------------------------------------------

// ✅ UPDATE: MOCK Animated API to return static values and mock methods
const Animated = require("react-native").Animated;
jest.spyOn(require("react-native"), "Animated", "get").mockReturnValue({
  ...Animated,
  Value: jest.fn(() => ({
    // Mock the value object methods to prevent crashes
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  // Mock animation functions to prevent them from starting
  timing: jest.fn(() => ({ start: jest.fn() })),
  sequence: jest.fn(),
  loop: jest.fn(),
});

// ✅ UPDATE: MOCK useEffect to prevent animation logic from running
// This stops the `useEffect` block inside Cloud.tsx from calling Animated.loop().start()
jest.spyOn(require("react"), "useEffect").mockImplementation(() => {});

// Mock the image assets as strings/numbers to avoid asset loading errors
jest.mock("@assets/images/Cloud.png", () => "CloudImg");
jest.mock("@assets/images/InvertedCloud.png", () => "InvertedCloudImg");
jest.mock("@assets/images/SunWithCloud.png", () => "SunWithCloudImg");

describe("Cloud.tsx Snapshot Test", () => {
  it("matches the stored snapshot to lock the component's visual structure", () => {
    // Render the component using the test renderer
    const tree = renderer.create(<Cloud />).toJSON();

    // ✅ ASSERTION: This creates the snapshot on the first run, and checks it on subsequent runs.
    // If the component's structure or styles change unexpectedly, this test will fail.
    expect(tree).toMatchSnapshot();
  });
});
