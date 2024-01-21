module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["react", "@typescript-eslint", "prettier", "unused-imports"],
  parser: "@typescript-eslint/parser",
  // Ignore config files because they are mostly using different js version to build
  // We could write a different esbuild for these but I don't think it's necessary at this point
  ignorePatterns: [
    "babel.config.js",
    ".eslintrc.js",
    "commitlint.config.js",
    "jest.config.js",
    "config/jest/*.js",
    "cypress/plugins/*.js",
    "cypress/support/*.js",
  ],
  rules: {
    indent: ["warning", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".ts", ".tsx", ".js"],
      },
    ],
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
};
