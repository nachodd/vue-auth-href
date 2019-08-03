module.exports = {
  root: true,

  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module",
  },

  env: {
    browser: true,
  },
  extends: [
    "plugin:vue/recommended",
    "@vue/prettier"
  ],

  // required to lint *.vue files
  plugins: ["vue"],

  globals: {
    process: true,
    _: true,
  },

  rules: {
    "linebreak-style": 0,
    "no-async-promise-executor": "off",
    "prefer-promise-reject-errors": "off",
    "no-empty": ["error", { allowEmptyCatch: true }],
    "prettier/prettier": [
      "error",
      {
        semi: false,
        trailingComma: "all",
        htmlWhitespaceSensitivity: "ignore",
        "html-whitespace-sensitivity": "ignore",
      },
    ],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
}
