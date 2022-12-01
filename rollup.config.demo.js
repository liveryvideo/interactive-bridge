import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

// Until this is supported by ESLint we'll use the workaround below
// See: https://rollupjs.org/guide/en/#caveats-when-using-native-node-es-modules
// import pkg from './package.json' assert { type: 'json' };

import { readFileSync } from 'node:fs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)),
);

const common = {
  output: { dir: 'dist' },
  plugins: [
    typescript(),
    replace({
      preventAssignment: true,
      values: {
        __VERSION__: pkg.version,
      },
    }),
    resolve(),
    html({
      injectServiceWorker: true,
    }),
  ],
};

export default [
  {
    ...common,
    input: './demo/index.html',
  },
  {
    ...common,
    input: './demo/mock.html',
  },
];
