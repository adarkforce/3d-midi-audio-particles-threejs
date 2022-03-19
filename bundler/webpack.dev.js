import { merge } from "webpack-merge";
import commonConfiguration from "./webpack.common.js";
import { internalIpV4Sync } from "internal-ip";

const infoColor = (_message) => {
  return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;
};

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
    onAfterSetupMiddleware: function (app, server, compiler) {
      const localIp = internalIpV4Sync();
      const domain1 = `http://${localIp}:${PORT}`;
      const domain2 = `http://localhost:${PORT}`;

      console.log(
        `Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(
          domain2
        )}`
      );
    },
  },
});
