
// html头部配置项
const options = {
  lang: "en",
  title: "华泰证券",
  meta: [
    {
      name: "charset",
      content: "utf-8"
    }
  ]
};

// prod配置项
const prodOptions = {
  ...options,
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
  },
  // necessary to consistently work with multiple chunks via CommonsChunkPlugin
  chunksSortMode: "dependency"
};

function getPages(entries) {
  const pages = {};
  const isDev = process.env.NODE_ENV !== "production";
  const finalOptions = isDev ? options : prodOptions;

  entries.forEach(entryItem => {
    const { name, entry, inject = true, template = "public/index.html" } = entryItem;
    const common = {
      filename: `${name}.html`,
      inject,
      template,
      chunks: ["chunk-vendors", "chunk-common", `${name}_standalone`],
      ...finalOptions
    };
    pages[`${name}_standalone`] = {
      entry: entry.standalone,
      ...common
    };
    pages[name] = {
      entry: entry.app,
      ...common
    };
  });
  return pages;
}

module.exports = getPages;
