// const path = require('path');

// module.exports = {
// 	entry: ["./game/game.ts",],
// 	output: {
// 		filename: 'game.js',
// 		path: path.resolve(__dirname, 'dist/static'),
// 	},
// 	mode: 'development',
// 	resolve: {
// 		extensions: ['.js', '.jsx', '.ts', '.tsx'],
// 	}
// };


const path = require('path');

module.exports = {
	entry: ["./game/libpong.ts"],
	output: {
		filename: 'libpong.js',
		path: path.resolve(__dirname, 'dist/static'),
		library: {
			name: 'libpong',
			type: 'umd'
		}
	},
	mode: 'development',
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx']
	},
	module: {
		rules: [
		//   { test: /\.ts?$/, loader: "ts-loader" }
			{ test: /game\/.*\.ts$/, loader: "ts-loader" }
		]
	  }
};

//^.*xpto\/+.*\/+example.xyz$
//s.match(/voici[^]*ligne/);
// Renvoie ['voici\nune autre ligne']