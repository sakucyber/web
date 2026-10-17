/**
 * ESLint 扁平配置（ESLint 10 + TypeScript + Astro）
 * 运行：npm run lint / npm run lint:fix
 */
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    'node_modules/',
    '.astro/',
    'projects/',
    'public/games/',
    'src/assets/',
    'package-lock.json',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 客户端脚本里会用到 console 排查，不视为错误
      'no-console': 'off',
      // TS 自己会做未定义检查，避免和类型声明重复
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/triple-slash-reference': 'off',
      // Astro 组件模板里会用到内联 style 变量（--d），无需限制
      'astro/no-unused-css-selector': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Astro 文件里 <script> 是模块，Node/浏览器全局混用是正常的
      'no-undef': 'off',
    },
  },
]);
