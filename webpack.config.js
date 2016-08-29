var path = require('path');
var webpack = require('webpack');
var merge = require('lodash/merge');

var srcPath = path.join(__dirname, 'src');
var distPath = path.join(__dirname, 'dist');

var params = {
    'debug': false,
    'devtool': undefined,
    'target': 'web',
    'entry': {
        'edefine': './edefine.js'
    },
    'context': srcPath,
    'output': {
        'filename': '[name].js',
        'path': distPath
    },
    'externals': {
        'ns': 'ns'
    },
    'module': {
        'preLoaders': [
            {
                'test': /\.js$/,
                'loader': 'eslint',
                'include': [ srcPath ]
            }
        ],
        'loaders': [
            {
                'test': /\.js$/,
                'loader': 'babel',
                'include': [ srcPath ]
            }
        ]
    }
};

var runs = [
    params,

    merge({}, params, {
        'output': {
            'filename': '[name].min.js',
        },
        'plugins': [
            new webpack.optimize.UglifyJsPlugin({
                'output': {
                    'comments': false
                },
                'compress': {
                    'warnings': false
                }
            })
        ],
        'devtool': '#source-map'
    })
];

module.exports = runs;
