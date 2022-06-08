const path = require('path');

module.exports = {
  mode: "production",
  entry: "./build",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  }
};
