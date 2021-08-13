
const WebpackAssetsManifest = require("webpack-assets-manifest");

function getJsons(entries) {
  let jsons = [];
  // const isDev = process.env.NODE_ENV !== "production";
  jsons = [
    ...entries.map(
      entry =>
        new WebpackAssetsManifest({
          output: `${entry.name}.json`,
          entrypoints: true,
          entrypointsKey: false,
          publicPath: true,
          transform(assets) {
            // return assets[entry.name];
            // dev 模式下没有单独隔离css，但是bigbox中会检测json的css项，所以暂时补充一个空数组。
            // TODO: 在bigbox中去除对于css的为空抛错
            var finalJson = assets[entry.name];
            if (!finalJson.css) {
              finalJson.css = [];
            }
            return finalJson;
          }
        })
    )
  ];
  return jsons;
}

module.exports = getJsons;
