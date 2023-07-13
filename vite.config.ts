import browserslistToEsbuild from 'browserslist-to-esbuild';
import { execSync } from 'child_process';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import { dependencies } from './package.json';

/**
 * Returns version string using git describe; more readable and relevant then a git hash.
 */
function getVersion() {
  return execSync('git describe --tags --dirty')
    .toString()
    .trim()
    .replace(/^v/, '');
}

/**
 * CLI                        Command Mode          Description
 * =====================================================================================================================
 * vite                       serve   development   Serves index.html for development with supported browsers
 * vitest                     serve   test          Runs unit tests in /test/
 * vite preview               serve   production    Serves index.html bundled for preview by supported browsers
 * vite build                 build   production    Bundles index.html into /dist/ for testing by supported browsers
 * vite build -m lib:bundler  build   lib:bundler   Bundles index.ts to /dist/index.(js|d.ts) for use by ES2019 bundlers
 * vite build -m lib:browser  build   lib:browser   Bundles index.ts to /dist/index.umd.js for use by supported browsers
 */
export default defineConfig(({ mode }) => ({
  // Keep in sync with: env.d.ts
  define: {
    __VERSION__: `"${getVersion()}"`,
  },

  build: {
    assetsInlineLimit: 1e6,
    target: mode === 'lib:bundler' ? 'es2019' : browserslistToEsbuild(),
    lib: mode.startsWith('lib')
      ? {
          entry: './index.ts',
          name: 'livery',
          formats: mode === 'lib:browser' ? ['umd'] : ['es'],
          fileName: (format) =>
            format !== 'es' ? `index.${format}.js` : `index.js`,
        }
      : undefined,
    rollupOptions: {
      input: mode === 'production' ? ['index.html', 'mock.html'] : undefined,
      external:
        mode === 'lib:bundler'
          ? (id) => Object.keys(dependencies).includes(id.replace(/\/.*/, ''))
          : undefined,
    },
  },

  plugins: [
    // TODO: Strip 'Excluded from this release type' and private field lines from index.d.ts
    mode === 'lib:bundler' ? dts({ rollupTypes: true }) : undefined,
  ],

  test: {
    include: ['./test/**/*.test.ts'],
    environment: 'happy-dom', // seems to work slightly better and faster than jsdom
    // TODO: Run tests in actual, headless browser
    // browser: { enabled: true, name: 'chrome', headless: true },
    // Run tests of our elements with Playwright (e.g: @sand4rt/experimental-ct-web)?
  },
}));
