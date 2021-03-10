import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';
import cpy from 'rollup-plugin-cpy';

const config = createSpaConfig({
  injectServiceWorker: true,
});

export default merge(config, {
  input: './demo/index.html',
  plugins: [
    cpy({
      files: ['demo/*', '!demo/index.html'],
      dest: 'dist',
    }),
  ],
});
