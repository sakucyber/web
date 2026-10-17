// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeSafeMarkdown } from './src/lib/rehype-safe-markdown.mjs';

/**
 * Astro 配置
 * - 纯静态输出，`npm run build` 生成 `dist/`，可直接部署到 Cloudflare Pages
 * - Markdown 在构建期通过本地 rehype 插件做 XSS 清洗（去掉 script/iframe、on* 属性、
 *   javascript: 协议），并在外链上补 rel="noopener noreferrer"
 * - 图片交给 Astro 内置的 sharp 管线，构建期生成 AVIF/WebP + 多尺寸 srcset
 */
export default defineConfig({
  site: 'https://buling.qzz.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  markdown: {
    // 代码高亮使用构建期 Shiki，零运行时 JS；同时输出浅色 / 深色两套配色，
    // 由全局 CSS 根据 data-theme 切换，主题切换时代码块也跟着变。
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      wrap: true,
    },
    rehypePlugins: [rehypeSafeMarkdown],
  },
  image: {
    // 构建期用 sharp 生成多尺寸、多格式图片
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      // 不内联小 chunk：保证所有脚本都是可缓存的独立文件，CSP 可以保持 script-src 'self'
      assetsInlineLimit: 0,
    },
  },
});
