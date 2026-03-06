import { defineConfig } from 'tsdown';
import { banner } from './lib/index.ts';
import pkg from './package.json' with { type: 'json' };

export default defineConfig([
  {
    name: 'Library',
    entry: './lib/index.ts',
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    exports: true,
    banner: {
      js: banner({
        pkg,
      }),
    },
  },
]);
