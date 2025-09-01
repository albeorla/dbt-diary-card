// Minimal ESLint config using Next + Prettier
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    // Relax rules we don't enforce yet; iterate later
    "@next/next/no-img-element": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "prefer-const": "off",
  },
};
