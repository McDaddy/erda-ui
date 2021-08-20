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

const AutomaticVendorFederation = require('@module-federation/automatic-vendor-federation');
const packageJson = require('./package.json');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const { parsed: envConfig } = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!envConfig) {
  throw Error('cannot find .env file in erda-ui root directory');
}

const remotes = {};
const entries = [];
const { MODULES } = envConfig;
const excludeModules = ['market', 'shell'];

MODULES.split(',')
  .filter((m) => !excludeModules.includes(m))
  .forEach((m) => {
    remotes[m] = `mf_${m}@/static/${m}/scripts/mf_${m}.js`;
    if (m !== 'core') {
      entries.push(`${m}: import('${m}/entry'),`);
    }
  });

console.log('================ remotes: =================\n', remotes);

fs.writeFileSync(
  path.resolve(__dirname, './app/mf-modules.js'),
  `
export default {
  ${entries.join('\n')}
};
`,
);

module.exports = [
  {
    name: 'mf_share',
    exposes: {
      './layout/stores/layout': path.resolve(__dirname, './app/layout/stores/layout.ts'),
      './layout/entry': path.resolve(__dirname, './app/layout/entry.js'),
      './layout/error-page': path.resolve(__dirname, './app/layout/common/error-page.tsx'),
      './common/utils': path.resolve(__dirname, './app/common/utils/index.ts'),
      './common/all': path.resolve(__dirname, './app/common'),
      './cmp/pages/cluster-manage/operation-history': path.resolve(
        __dirname,
        './app/modules/cmp/pages/cluster-manage/operation-history',
      ),
      './org/pages/safety': path.resolve(__dirname, './app/modules/org/pages/safety'),
      './user/store': path.resolve(__dirname, './app/user/stores/index.ts'),
      './erda-icon': path.resolve(__dirname, './node_modules/@icon-park/react'),
      './org-home/stores/org': path.resolve(__dirname, './app/org-home/stores/org.tsx'),
    },
  },
  {
    name: 'main',
    remotes,
    shared: {
      ...AutomaticVendorFederation({
        exclude: ['babel', 'plugin', 'preset', 'webpack', 'loader', 'serve'],
        ignoreVersion: ['react-router-dom', 'react-router-config', 'history'],
        packageJson,
        shareFrom: ['dependencies', 'peerDependencies'],
        ignorePatchVersion: true,
      }),
      react: {
        singleton: true,
        requiredVersion: packageJson.dependencies.react,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: packageJson.dependencies['react-dom'],
      },
      '@icon-park/react': {
        requiredVersion: packageJson.dependencies['@icon-park/react'],
      },
    },
  },
];
