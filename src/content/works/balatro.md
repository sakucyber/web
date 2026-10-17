---
title: "小丑牌"
description: "用 React + useReducer 写的 Balatro 风格卡牌游戏：凑牌型、堆小丑、乘算分数，挑战 8 轮盲注。"
date: 2026-09-28
tags: ["游戏", "React", "小丑牌"]
cover: card-girl
emoji: "🃏"
href: "/project/balatro"
linkLabel: "开始游戏"
featured: true
order: 3
status: "可试玩"
stack: ["React", "Vite", "JavaScript"]
noindex: false
---

在浏览器里还原《小丑牌》的核心循环：选牌 → 算分 → 进商店 → 下一轮。

- **牌型与倍率**：从高牌到同花五条共 13 种，筹码 × 倍率 × 乘算；
- **五十多张小丑**：花色加成、牌型条件、乘算、经济流都有；
- **完整单局**：8 轮盲注配置、Boss 限制、商店刷新与利息。

React 18 + Vite 构建，最终打包成一个可以直接打开的 HTML。🃏
