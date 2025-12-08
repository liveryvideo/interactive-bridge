import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative as relativePath } from 'node:path';
import process from 'node:process';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import { dependencies } from './package.json';

/**
 * Returns environment string.
 *
 * For 'test' runs and 'lib:*' builds this will just return the mode string.
 * For local 'development' and amplify 'production' builds this will abbreviate to 'dev' and 'prod'
 * and append a '-[git branch]' suffix.
 */
function getEnv(mode: string) {
  if (mode === 'development') {
    return `dev-${getGitBranch()}`;
  }
  if (mode === 'production') {
    return `prod-${getGitBranch()}`;
  }
  return mode;
}

/**
 * Returns git branch.
 *
 * Note: From AWS Amplify CD (e.g: using a detached git HEAD) we can't use git for this
 * so we use environment variables when available.
 */
function getGitBranch() {
  const { AWS_BRANCH, CIRCLE_BRANCH } = process.env;
  return (
    AWS_BRANCH ||
    CIRCLE_BRANCH ||
    execSync('git branch --show-current').toString().trim()
  );
}

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
 * Patches @packageDocumentation from index.ts back into dist/index.d.ts bundle (vite-plugin-dts v3.8 regression).
 * Only uses publicly exported globals defined by index.ts instead of also declaring internal and dependency globals.
 * Strips 'Excluded from this release type' and private class member lines from bundle.
 *
 * See also: https://github.com/microsoft/rushstack/issues/1709
 *
 * Note: This is just a brittle hacked together regex work around, but it's good enough for now.
 */
function patchDts() {
  let pass = 0;
  return (filePath: string, content: string) => {
    // Ignore other files
    if (relativePath('.', filePath) !== 'dist/index.d.ts') {
      return;
    }

    // dist/index.d.ts passes through twice, global declares are only added after the first pass
    pass += 1;
    if (pass === 1) {
      return;
    }

    const ts = readFileSync('./index.ts', 'utf-8');
    const pkgDocMatches = ts.match(
      /^\/\*\*[\s\S]*?^ \* @packageDocumentation\n \*\/\n/m,
    );
    if (!pkgDocMatches) {
      throw new Error('@packageDocumentation block not found in /index.ts');
    }
    const pkgDoc = pkgDocMatches[0];

    // convert CRLF output of vite-plugin-dts to LF
    const lfContent = content.replace(/\r/g, '');

    // Our manually curated declare global block from the entry file: index.ts should be the first match
    const declareMatches = lfContent.match(/^declare global {[\s\S]*?^}\n/m);
    if (!declareMatches) {
      throw new Error('declare global block not found in dts content');
    }
    const declare = declareMatches[0];

    const stripped = lfContent
      .replace(/^declare global {[\s\S]*?^}\n+/gm, '')
      .replace(/^ *\/\* Excluded from this release type: .* \*\/\n+/gm, '')
      .replace(/^ +private .*\n+/gm, '');

    return { content: `${pkgDoc}\n${stripped}\n${declare}`, filePath };
  };
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
export default defineConfig(({ command, mode }) => ({
  build: {
    assetsInlineLimit: 1e6,
    lib: mode.startsWith('lib')
      ? {
          entry: './index.ts',
          fileName: (format) =>
            format !== 'es' ? `index.${format}.js` : 'index.js',
          formats: mode === 'lib:browser' ? ['umd'] : ['es'],
          name: 'livery',
        }
      : undefined,
    rollupOptions: {
      external:
        mode === 'lib:bundler'
          ? (id) => Object.keys(dependencies).includes(id.replace(/\/.*/, ''))
          : undefined,
    },
    target: mode === 'lib:bundler' ? 'es2019' : browserslistToEsbuild(),
  },

  // Keep in sync with: env.d.ts
  define: {
    __ENV__: `"${getEnv(mode)}"`,
    __RECORD__:
      command === 'build' && (mode === 'production' || mode.startsWith('lib')),
    // Uncomment below to enable recording during development for testing purposes
    // __RECORD__: true,
    __VERSION__: `"${getVersion()}"`,
  },

  plugins: [
    mode === 'lib:bundler'
      ? dts({ beforeWriteFile: patchDts(), rollupTypes: true })
      : undefined,
  ],

  test: {
    environment: 'happy-dom', // seems to work slightly better and faster than jsdom
    include: ['./test/**/*.test.ts'],
    // TODO: Run tests in actual, headless browser
    // browser: { enabled: true, name: 'chrome', headless: true },
    // Run tests of our elements with Playwright (e.g: @sand4rt/experimental-ct-web)?
  },
}));
