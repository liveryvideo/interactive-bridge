import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';
import cpy from 'rollup-plugin-cpy';

export default [
  merge(createSpaConfig({}), {
    input: './demo/index.html',
    plugins: [
      cpy({
        files: ['demo/*', '!demo/index.html', '!demo/mock.html'],
        dest: 'dist',
      }),
    ],
  }),
  merge(createSpaConfig({}), {
    input: './demo/mock.html',
  }),
];
