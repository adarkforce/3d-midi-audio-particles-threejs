import { merge } from "webpack-merge";
import commonConfiguration from "./webpack.common.js";

const PORT = 8080;

export default merge(commonConfiguration, {
  mode: "development",
  devServer: {
    host: "localhost",
    port: PORT,
    static: "./dist",
    hot: true,
    open: true,
    https: true,
    allowedHosts: "all",
  },
});
