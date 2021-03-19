import { createSpaConfig } from '@open-wc/building-rollup';
import replace from '@rollup/plugin-replace';
import merge from 'deepmerge';
import cpy from 'rollup-plugin-cpy';
import pkg from './package.json';

export default [
  merge(createSpaConfig({}), {
    input: './demo/index.html',
    plugins: [
      replace({
        __VERSION__: pkg.version,
      }),
      cpy({
        files: ['demo/*', '!demo/index.html', '!demo/mock.html'],
        dest: 'dist',
      }),
    ],
  }),
  merge(createSpaConfig({}), {
    input: './demo/mock.html',
    plugins: [
      replace({
        __VERSION__: pkg.version,
      }),
    ],
  }),
];
