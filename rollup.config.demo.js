import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import html from '@web/rollup-plugin-html';
import pkg from './package.json';

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
