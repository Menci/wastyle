module.exports = {
    entry: __dirname + '/index.js',
    output: {
        filename: 'bundle.js',
        publicPath: 'dist/'
    },
    module: {
        rules: [{
            test: /\.wasm$/,
            loader: "file-loader",
            type: "javascript/auto"
        }]
    }
}
