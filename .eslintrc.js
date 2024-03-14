module.exports = {
  extends: [
    'alloy',
    'alloy/react',
  ],
  env: {
    // Your environments (which contains several predefined global variables)
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    // myGlobal: false
  },
  rules: {
    // Customize your rules
    "semi": "error",
    "no-debugger": "off",
    "react/jsx-fragments": "off"
  },
  settings: {
    react: {
      version: "^17.0.2" // 表示探测当前 node_modules 安装的 react 版本
    }
  }
};
