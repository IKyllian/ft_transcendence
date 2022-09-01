// var path = require("path");
// //var webpack = require("webpack");

// module.exports = {
// 	externals: [],
// 	entry: {
//         app: [
//             path.resolve(__dirname, 'src/static/game.ts')
//         ],
//         vendor: ['phaser']
//     },
//     output: {

//         path: path.resolve(__dirname, 'dist/static'),

//         filename: 'bundle.js'
//     }
//   };

const path = require('path');

module.exports = {
  entry: './game/game.ts',
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist/static'),
  },
  mode: 'development'
};