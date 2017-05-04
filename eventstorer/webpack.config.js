var webpack = require("webpack");
var path = require("path");
module.exports = {
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',

    // Add your application's scripts below
    './src/index.js',
  ],
  output: {
    path: path.join(__dirname, "build"),
    publicPath: '/',
    filename: "index.js", // no hash in main.js because index.html is a static page
    // chunkFilename: "[hash]/js/[id].js",
    // hotUpdateMainFilename: "[hash]/update.json",
    // hotUpdateChunkFilename: "[hash]/js/[id].update.js"
  },
//  debug: false,
  devtool: 'source-map',
  target: 'node',
  module: {
    loaders: [
      { test: /\.json$/,   loader: "json-loader" },
      { test: /\.md$/,   loader: "raw-loader" },
      { test: /LICENSE$/,   loader: "raw-loader" },
      {
	loader: "babel-loader",

	// Skip any files outside of your project's `src` directory
	include: [
          path.join(__dirname, "src"),
	],

	// Only run `.js` and `.jsx` files through Babel
	test: /\.js$/,

	// Options to configure babel with
	query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0'],
	}
      },
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/)
  ]
};
