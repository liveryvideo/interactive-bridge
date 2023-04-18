import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fileURLToPath } from 'url';

export default {
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
  ],
  watch: true,
};
