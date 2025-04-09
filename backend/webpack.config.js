const path = require('path');

module.exports = {
    entry: './server.js', // Entry point of your Express app
    target: 'node', // Ensures Webpack bundles for Node.js
    mode: 'development', // Change this to 'development' or 'production' as needed
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'server.bundle.js', // Output bundle name
    },
    resolve: {
      extensions: ['.js'],
    },
    externals: [require('webpack-node-externals')()], // Excludes node_modules from the bundle
  };
  
