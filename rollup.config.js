import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const banner = `/**
* ${pkg.name} v${pkg.version}
* (C) 2018-${new Date().getFullYear()} ${pkg.author}
* Released under the ${pkg.license} License.
*/`;

const common = {
  input: 'build/index.js',
  plugins: [
    replace({
      __VERSION__: pkg.version,
    }),
    resolve(),
    terser(),
  ],
};

export default [
  {
    ...common,
    external: (id) => {
      // Note: not just 'lodash-es', but also 'lodash-es/debounce' is external
      for (const dep of Object.keys(pkg.dependencies)) {
        if (id === dep || id.startsWith(`${dep}/`)) {
          return true;
        }
      }
      return false;
    },
    output: {
      banner,
      file: pkg.module,
      format: 'es',
    },
  },
  {
    ...common,
    output: {
      banner,
      file: pkg.main,
      format: 'umd',
      name: 'livery',
    },
    plugins: [
      ...common.plugins,
      babel({
        babelHelpers: 'bundled',
        exclude: ['node_modules/**', 'build/ext/**'],
        presets: ['@babel/preset-env'],
      }),
    ],
  },
];
