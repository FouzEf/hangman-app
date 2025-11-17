import { jest } from "@jest/globals";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../fireBaseConfig";

jest.mock("../fireBaseConfig", () => require("../__mocks__/firebaseConfig"));

describe("Firebase config", () => {
  it("initializes Firebase with mock config", () => {
    const app = initializeApp(firebaseConfig);
    expect(app.options.projectId).toBe("test-project-id");
  });
});
