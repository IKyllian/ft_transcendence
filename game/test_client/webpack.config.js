const path = require('path');

module.exports = {
  entry: ["./game/game.ts",],
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist/static'),
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }
};