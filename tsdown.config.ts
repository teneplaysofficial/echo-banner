import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'Library',
    entry: './lib/index.ts',
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    exports: true,
  },
]);
