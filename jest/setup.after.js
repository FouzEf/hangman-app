// jest/setup.after.js
import "@testing-library/jest-native/extend-expect";

// IMPORTANT: do NOT force timers cleanup here; tests that need fake timers will enable them.
// If you previously had afterEach calling runOnlyPendingTimers/clearAllTimers, remove it.
