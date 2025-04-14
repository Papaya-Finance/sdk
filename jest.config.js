/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  bail: false,
  testMatch: [
    '**/PapayaSDK.test.ts',
    '**/rateConversion.test.ts', 
  ],
  // Set a timeout of 10 seconds for tests
  testTimeout: 10000,
};

module.exports = config; 