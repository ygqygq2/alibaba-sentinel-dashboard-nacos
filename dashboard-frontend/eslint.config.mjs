import eslint from '@eslint/js';
import react from '@ygqygq2/eslint-config/react.mjs';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(eslint.configs.recommended, ...tseslint.configs.recommended, ...react, {
  ignores: ['*.cjs'],
  rules: {},
});
