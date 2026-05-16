module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.spec.json" }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.dto.ts",
    "!src/database/schema.ts",
  ],
  coverageDirectory: "coverage",
  testEnvironment: "node",
};
