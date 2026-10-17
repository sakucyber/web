const BLIND_CONFIGS = {
  1: { small: { name: '小盲注', target: 300, reward: 3 }, big: { name: '大盲注', target: 450, reward: 4 }, boss: { name: '钩子', target: 600, reward: 5, effect: '每回合弃牌次数-1' } },
  2: { small: { name: '小盲注', target: 800, reward: 3 }, big: { name: '大盲注', target: 1100, reward: 4 }, boss: { name: '墙壁', target: 1500, reward: 5, effect: '手牌上限-1' } },
  3: { small: { name: '小盲注', target: 2000, reward: 3 }, big: { name: '大盲注', target: 2600, reward: 4 }, boss: { name: '车轮', target: 3500, reward: 5, effect: '每打出一次手牌随机翻转一张手牌' } },
  4: { small: { name: '小盲注', target: 5000, reward: 4 }, big: { name: '大盲注', target: 6500, reward: 5 }, boss: { name: '手臂', target: 8500, reward: 6, effect: '降低一级出牌类型等级' } },
  5: { small: { name: '小盲注', target: 11000, reward: 4 }, big: { name: '大盲注', target: 14000, reward: 5 }, boss: { name: '石头', target: 18000, reward: 6, effect: '必须出顺子或以上' } },
  6: { small: { name: '小盲注', target: 22000, reward: 4 }, big: { name: '大盲注', target: 28000, reward: 5 }, boss: { name: '鱼', target: 35000, reward: 7, effect: '打出后手牌全部弃掉' } },
  7: { small: { name: '小盲注', target: 45000, reward: 5 }, big: { name: '大盲注', target: 55000, reward: 6 }, boss: { name: '紫罗兰容器', target: 70000, reward: 7, effect: '最多打出一张牌' } },
  8: { small: { name: '小盲注', target: 100000, reward: 5 }, big: { name: '大盲注', target: 120000, reward: 6 }, boss: { name: '紫罗兰容器', target: 150000, reward: 8, effect: '最多打出一张牌' } },
};

export function getBlindConfig(ante, type) {
  const anteConfig = BLIND_CONFIGS[Math.min(ante, 8)] || BLIND_CONFIGS[8];
  return anteConfig[type] || anteConfig.small;
}

export function getAnteTargets(ante) {
  const config = BLIND_CONFIGS[Math.min(ante, 8)] || BLIND_CONFIGS[8];
  return {
    small: { ...config.small },
    big: { ...config.big },
    boss: { ...config.boss },
  };
}
