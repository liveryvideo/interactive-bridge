import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// Until this is supported by ESLint we'll use the workaround below
// See: https://rollupjs.org/guide/en/#caveats-when-using-native-node-es-modules
// import pkg from './package.json' assert { type: 'json' };

import { readFileSync } from 'fs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)),
);

const banner = `/**
* ${pkg.name} v${pkg.version}
* (C) 2018-${new Date().getFullYear()} ${pkg.author}
* Released under the ${pkg.license} License.
*/`;

const common = {
  input: 'index.ts',
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      // Work around this plugin producing dist/dist/index.d.ts instead of dist/index.d.ts
      declarationDir: '.',
      // Prevent /demo/ and /test/ .d.ts files from ending up in /dist/ somehow
      exclude: ['demo/**/*', 'test/**/*'],
    }),
    replace({
      preventAssignment: true,
      values: {
        __VERSION__: pkg.version,
      },
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
        exclude: ['node_modules/**'],
        presets: ['@babel/preset-env'],
      }),
    ],
  },
];
