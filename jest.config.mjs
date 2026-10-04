import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import("jest").Config} */
const customJestConfig = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  testTimeout: 60000,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@prisma/client/runtime/(.*)$":
      "<rootDir>/node_modules/@prisma/client/runtime/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@prisma|@prisma/client|@prisma/adapter-mariadb)/)",
  ],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/generated/",
    "<rootDir>/node_modules/",
  ],
};

export default createJestConfig(customJestConfig);
