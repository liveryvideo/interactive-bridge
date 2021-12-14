import replace from '@rollup/plugin-replace';
import html from '@web/rollup-plugin-html';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const common = {
  output: { dir: 'dist' },
  plugins: [
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
