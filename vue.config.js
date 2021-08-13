const getPages = require('./build/pages');
const getJsons = require('./build/jsons');
// const logUrl = 'http://168.63.129.230:8106';
const logUrl = 'http://168.61.8.185:9091';

const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NormalModuleWebpackReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const nls = require.resolve('./src/lib/nls-replace');

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new NormalModuleWebpackReplacementPlugin(/\/(vscode\-)?nls\.js/, resource => {
    resource.request = nls;
    resource.resource = nls;
  }),
  new MonacoWebpackPlugin({
    output: './js',
    languages: ['sql', 'shell', 'json']
  }),
  new CopyWebpackPlugin([
    {
      from: './gitbook',
      to: './gitbook',
      ignore: ['.*']
    }
  ]),
  new MonacoWebpackPlugin({
    features: ['！gotoSymbol']
  })
];

if (isProduction) {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsOptions: { source: false }
    })
  );
  plugins.push(
    new CompressionWebpackPlugin({
      test: /\.(js|css)(\?.*)?$/i,
      threshold: 10240,
      deleteOriginalAssets: false
    })
  );
}

module.exports = {
  publicPath: isProduction ? '/public/' : '/',
  productionSourceMap: false,
  // lintOnSave: process.env.NODE_ENV !== 'production',
  lintOnSave: false,
  transpileDependencies: ['vue-echarts', 'resize-detector'],
  css: {
    extract: true,
    sourceMap: false,
    modules: false,
    loaderOptions: {
      sass: {
        data: `@import "@scss/variable.scss";`
      },
      less: {
        modifyVars: { 'ant-prefix': 'sloth' },
        javascriptEnabled: true
      }
    }
  },

  parallel: require('os').cpus().length > 1,
  devServer: {
    proxy: {
      '/api': {                       //需要代理的接口
        target:'http://168.61.114.19:8080/HTAI/portal/api', //目标服务器
        changeOrigin: true,　　　　　　 //是否跨域
        pathRewrite: {
          '^/api': '/api'             //重定向
        }
      }
      // "/log/sa": {
      //   target: logUrl,
      //   changeOrigin: true, // 是否改变域名
      //   ws: true,
      //   pathRewrite: { '^/log/sa': '/sa' },
      // }
    }
  },
  configureWebpack: {
    // devtool: 'cheap-eval-source-map',
    resolve: {
      alias: {
        '@config': path.join(path.resolve(__dirname), 'config'),
        '@decorators': path.join(path.resolve(__dirname), 'src/decorators'),
        '@': path.resolve(__dirname, 'src'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@scss': path.resolve(__dirname, 'src/scss'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@lib': path.resolve(__dirname, 'src/lib')
      }
    },
    performance: {
      "maxEntrypointSize": 10000000,
      "maxAssetSize": 30000000
    },
    externals:
      process.env.NODE_ENV !== 'production'
        ? {}
        : {
          '@lego/bigbox-utils': 'bigboxUtils'
        },
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       vendors: {
    //         // key 为entry中定义的 入口名称
    //         chunks: 'all', // 必须三选一： "initial" | "all" | "async"(默认就是async)
    //         minChunks: 1,
    //         // reuseExistingChunk: true ,// 可设置是否重用该chunk
    //         minSize: 1000
    //       }
    //     }
    //   }
    // },
  }
};
