const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      util: require.resolve("util/"),
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
    },
  },
};
