# 小丑牌（Balatro 风格卡牌小游戏）

这是站点 `/project/balatro` 背后的独立小游戏工程，技术栈为 **React 18 + Vite**，
源码不参与主站（Astro）构建，产物以静态文件形式发布。

## 目录

```
projects/balatro/
├── index.html          # Vite 入口
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── components/     # 手牌、商店、小丑牌区、计分动画等
    └── game/           # reducer / 牌型 / 计分 / 小丑 / 盲注 / 商店
```

## 本地构建

```bash
cd projects/balatro
npm install
npm run build
```

Vite 默认会生成 `dist/`。主站发布的是「单文件 HTML」形态，放在
`public/games/balatro/`，访问路径为 `/games/balatro/`。

## 发布到主站

1. 构建后把产物 HTML 转成主站可用的静态文件：
   - `index.html` 中原本内联的 `<script type="module">` 已抽成外链
     `assets/app.js`（这样主站的严格 CSP `script-src 'self'` 才能放行）；
   - 内联 `<style>` 里指向 Google Fonts 的 `@import` 已移除（改用系统字体兜底）。
2. 用新的构建产物替换：
   - `public/games/balatro/index.html`
   - `public/games/balatro/assets/app.js`
3. `npm run build`（在主站根目录）后检查 `/games/balatro/` 可正常游玩。

> 说明：当前仓库里的小游戏是旧版单文件构建经上述两步后处理得到的；
> 如果以后 Vite 构建换成外链资源输出，可以跳过拆分步骤。
