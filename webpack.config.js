var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    devtool: "source-map",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "app")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {loader: "eslint-loader"},
                ]
                , exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader"},
                ]
            },
            {
                test: /\.(png|jpg|otf|eot|svg|ttf|woff|woff2)(\?.*)?$/i,
                use: [
                    {loader: "url-loader"},
                ]
            }
        ],
        noParse: /\.elm$/
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        //Clean and minify JS bundle
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    ]
};