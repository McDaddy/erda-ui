// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

const config = require('./.erda/config');
const fs = require('fs');
const path = require('path');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const swaggerParserMock = require('swagger-parser-mock');
const pathToRegexp = require('path-to-regexp');
const Mock = require('mockjs');

const backendUrl = config.DEV_URL;
let mockPath = [];
if (fs.existsSync('./swagger.json')) swaggerParserMock({ spec: require('./swagger.json') }).then((docs) => { mockPath = docs.paths; });

const redirectPaths = [
  '/microService',
  '/workBench',
  '/dataCenter',
  '/orgCenter',
  '/edge',
  '/sysAdmin',
  '/org-list',
  '/noAuth',
  '/freshMan',
  '/inviteToOrg',
  '/perm',
];

module.exports = config.wrapWebpack({
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  watchOptions: {
    aggregateTimeout: 500,
    ignored: [
      'node_modules', 'public', 'test', 'docs', 'tmp',
    ],
    poll: 5000,
  },
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, 'public'),
    index: 'index.html',
    open: true,
    noInfo: false,
    progress: false,
    historyApiFallback: true,
    watchContentBase: false,
    liveReload: false,
    hot: true,
    watchOptions: {
      // @@@ 独立模块列表
      ignored: [
        'node_modules', 'public', 'test', 'docs', 'tmp', 'tools', 'cypress', 'interface',
        'app/external',
      ],
    },
    https: {
      key: fs.readFileSync('../cert/dev/server.key'),
      cert: fs.readFileSync('../cert/dev/server.crt'),
    },
    proxy: [
      {
        context: ['/api/websocket', '/api/apim-ws/api-docs/filetree'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      {
        context: redirectPaths,
        bypass(req, res) {
          const firstPath = (req.url || '').split('/')[1];
          if (redirectPaths.includes(`/${firstPath}`)) {
            res.redirect(`/-${req.url}`);
            return true;
          }
        },
      },
      {
        context: ['/fdp-app/'],
        target: backendUrl, // incase need local debug
        secure: false,
        changeOrigin: true,
        // pathRewrite: { '^/fdp-app': '' },
      },
      {
        context: ['/api', '/ta'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        // ignorePath: false,
        onProxyRes(proxyRes, req, res) {
          if (proxyRes.statusCode === 404 || proxyRes.statusCode === 503) {
            Object.keys(mockPath).forEach((mockUrl) => {
              mockPath[mockUrl].mockUrl = mockUrl.replace(/{/g, ':').replace(/}/g, '');
              if (pathToRegexp(mockPath[mockUrl].mockUrl).exec(req.path)) {
                const responses = mockPath[mockUrl][req.method.toLowerCase()].responses[200].example && JSON.parse(mockPath[mockUrl][req.method.toLowerCase()].responses[200].example);
                res.json(Mock.mock(responses));
                console.log(`mock to: ${req.method} ${mockUrl}`);
              }
            });
          }
        },
        bypass: (req, res) => {
          if (req.headers && req.headers.referer) {
            url = new URL(req.headers.referer);
            url.host = 'dice.dev.terminus.io';
            req.headers.referer = url.href;
          }
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].chunk.js',
  },
  stats: { children: false },
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: 'Erda UI Development',
    }),
  ],
  optimization: {
    minimize: false,
  },
});
