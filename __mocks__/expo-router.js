// __mocks__/expo-router.js
import { jest } from "@jest/globals";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

export const useRouter = () => ({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
});

export const useLocalSearchParams = () => ({});

// Export mocks to be cleared/checked in tests
export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
};
