'use strict'
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const { resolve,posix } = require('path');

const baseWebpackConfig = require('./webpack.base.config');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const portfinder = require('portfinder');

const devWebpackConfig = merge(baseWebpackConfig, {
	entry: {
		app: [
			'babel-polyfill',
			'isomorphic-fetch',
			'react-hot-loader/patch',
			'./src/js/index.js',
		],
	},
	module: {
		rules:[{
			test: /\.scss$/,
			use: [{
				loader: 'style-loader',
			}, {
				loader: 'css-loader',
				options: {
					sourceMap: true,
				},
			}, {
				loader: 'resolve-url-loader',
			}, {
				loader: 'sass-loader',
				options: {
					sourceMap: true,
				},
			}],
		}]
	},
	devtool: config.dev.devtool,
	devServer: {
		clientLogLevel: 'warning',
		historyApiFallback: {
			rewrites: [
				{ from: /.*/, to: posix.join(config.dev.assetsPublicPath, 'index.html') },
			],
		},
		hot: true,
		contentBase: false,
		compress: true,
		host: 'localhost',
		port: config.dev.port,
		open: config.dev.autoOpenBrowser,
		overlay: config.dev.errorOverlay
			? { warnings: false, errors: true }
			: false,
		publicPath: config.dev.assetsPublicPath,
		proxy: config.dev.proxyTable,
		quiet: true, // necessary for FriendlyErrorsPlugin
		watchOptions: {
			poll: config.dev.poll,
		}
	},
	plugins: [
		// define global values
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: "'development'",
			},
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
		new webpack.NoEmitOnErrorsPlugin(),
		 // https://github.com/ampedandwired/html-webpack-plugin
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'templates/index.html',
			inject: true
		}),
		// copy custom static assets
		new CopyWebpackPlugin([
			{
				from: resolve(__dirname, '../static'),
				to: config.dev.assetsSubDirectory,
				ignore: ['.*']
			}
		])
	],
});

module.exports = new Promise((resolve, reject) => {
	portfinder.basePort = process.env.PORT || config.dev.port
	portfinder.getPort((err, port) => {
		if (err) {
			reject(err)
		} else {
			// publish the new Port, necessary for e2e tests
			process.env.PORT = port
			// add port to devServer config
			devWebpackConfig.devServer.port = port

			// Add FriendlyErrorsPlugin
			devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
				compilationSuccessInfo: {
					messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
				},
				onErrors: config.dev.notifyOnErrors
				? utils.createNotifierCallback()
				: undefined
			}))

			resolve(devWebpackConfig)
		}
	})
})