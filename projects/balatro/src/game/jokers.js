const JOKER_DEFS = [
  {
    id: 'joker',
    name: '小丑',
    cost: 2,
    rarity: 'common',
    description: '+4 倍率',
    effect: (ctx) => { ctx.mult += 4; },
  },
  {
    id: 'greedy_joker',
    name: '贪婪小丑',
    cost: 3,
    rarity: 'common',
    description: '打出的每张♦ +3 倍率',
    effect: (ctx) => {
      const diamonds = ctx.playedCards.filter(c => c.suit === 'diamonds').length;
      ctx.mult += diamonds * 3;
    },
  },
  {
    id: 'lusty_joker',
    name: '色欲小丑',
    cost: 3,
    rarity: 'common',
    description: '打出的每张♥ +3 倍率',
    effect: (ctx) => {
      const hearts = ctx.playedCards.filter(c => c.suit === 'hearts').length;
      ctx.mult += hearts * 3;
    },
  },
  {
    id: 'wrathful_joker',
    name: '愤怒小丑',
    cost: 3,
    rarity: 'common',
    description: '打出的每张♠ +3 倍率',
    effect: (ctx) => {
      const spades = ctx.playedCards.filter(c => c.suit === 'spades').length;
      ctx.mult += spades * 3;
    },
  },
  {
    id: 'gluttonous_joker',
    name: '暴食小丑',
    cost: 3,
    rarity: 'common',
    description: '打出的每张♣ +3 倍率',
    effect: (ctx) => {
      const clubs = ctx.playedCards.filter(c => c.suit === 'clubs').length;
      ctx.mult += clubs * 3;
    },
  },
  {
    id: 'jolly_joker',
    name: '欢乐小丑',
    cost: 3,
    rarity: 'common',
    description: '含有一对时 +8 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'PAIR' || ctx.handType === 'TWO_PAIR' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'THREE_OF_A_KIND' || ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.mult += 8;
      }
    },
  },
  {
    id: 'zany_joker',
    name: '滑稽小丑',
    cost: 4,
    rarity: 'common',
    description: '含有三条时 +12 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'THREE_OF_A_KIND' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.mult += 12;
      }
    },
  },
  {
    id: 'mad_joker',
    name: '疯狂小丑',
    cost: 4,
    rarity: 'common',
    description: '含有两对时 +10 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'TWO_PAIR' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.mult += 10;
      }
    },
  },
  {
    id: 'crazy_joker',
    name: '狂野小丑',
    cost: 4,
    rarity: 'common',
    description: '含有顺子时 +12 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'STRAIGHT' || ctx.handType === 'STRAIGHT_FLUSH' || ctx.handType === 'ROYAL_FLUSH') {
        ctx.mult += 12;
      }
    },
  },
  {
    id: 'droll_joker',
    name: '滑稽鬼脸',
    cost: 4,
    rarity: 'common',
    description: '含有同花时 +10 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'FLUSH' || ctx.handType === 'STRAIGHT_FLUSH' ||
          ctx.handType === 'ROYAL_FLUSH' || ctx.handType === 'FLUSH_HOUSE' || ctx.handType === 'FLUSH_FIVE') {
        ctx.mult += 10;
      }
    },
  },
  {
    id: 'sly_joker',
    name: '狡黠小丑',
    cost: 3,
    rarity: 'common',
    description: '含有一对时 +50 筹码',
    effect: (ctx) => {
      if (ctx.handType === 'PAIR' || ctx.handType === 'TWO_PAIR' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'THREE_OF_A_KIND' || ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.chips += 50;
      }
    },
  },
  {
    id: 'wily_joker',
    name: '机智小丑',
    cost: 4,
    rarity: 'common',
    description: '含有三条时 +100 筹码',
    effect: (ctx) => {
      if (ctx.handType === 'THREE_OF_A_KIND' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.chips += 100;
      }
    },
  },
  {
    id: 'clever_joker',
    name: '聪明小丑',
    cost: 4,
    rarity: 'common',
    description: '含有两对时 +80 筹码',
    effect: (ctx) => {
      if (ctx.handType === 'TWO_PAIR' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.chips += 80;
      }
    },
  },
  {
    id: 'devious_joker',
    name: '狡诈小丑',
    cost: 4,
    rarity: 'common',
    description: '含有顺子时 +100 筹码',
    effect: (ctx) => {
      if (ctx.handType === 'STRAIGHT' || ctx.handType === 'STRAIGHT_FLUSH' || ctx.handType === 'ROYAL_FLUSH') {
        ctx.chips += 100;
      }
    },
  },
  {
    id: 'crafty_joker',
    name: '狡猾小丑',
    cost: 4,
    rarity: 'common',
    description: '含有同花时 +80 筹码',
    effect: (ctx) => {
      if (ctx.handType === 'FLUSH' || ctx.handType === 'STRAIGHT_FLUSH' ||
          ctx.handType === 'ROYAL_FLUSH' || ctx.handType === 'FLUSH_HOUSE' || ctx.handType === 'FLUSH_FIVE') {
        ctx.chips += 80;
      }
    },
  },
  {
    id: 'half_joker',
    name: '半张小丑',
    cost: 5,
    rarity: 'common',
    description: '打出3张或以下时 +20 倍率',
    effect: (ctx) => {
      if (ctx.playedCards.length <= 3) ctx.mult += 20;
    },
  },
  {
    id: 'banner',
    name: '旗帜',
    cost: 5,
    rarity: 'common',
    description: '每剩余1次弃牌 +30 筹码',
    effect: (ctx) => {
      ctx.chips += ctx.discardsLeft * 30;
    },
  },
  {
    id: 'mystic_summit',
    name: '神秘顶峰',
    cost: 5,
    rarity: 'common',
    description: '0弃牌时 +15 倍率',
    effect: (ctx) => {
      if (ctx.discardsLeft === 0) ctx.mult += 15;
    },
  },
  {
    id: 'misprint',
    name: '错印',
    cost: 4,
    rarity: 'common',
    description: '随机 +0~23 倍率',
    effect: (ctx) => {
      ctx.mult += Math.floor(Math.random() * 24);
    },
  },
  {
    id: 'ice_cream',
    name: '冰淇淋',
    cost: 4,
    rarity: 'common',
    description: '+100 筹码，每回合-5筹码',
    sellCost: 1,
    effect: (ctx) => {
      const val = ctx.jokerData?.ice_cream_value ?? 100;
      ctx.chips += Math.max(0, val);
    },
    onRoundEnd: (state, joker) => {
      const current = joker.ice_cream_value ?? 100;
      joker.ice_cream_value = Math.max(0, current - 5);
      if (joker.ice_cream_value <= 0) {
        state.jokers = state.jokers.filter(j => j.id !== joker.instanceId);
      }
      return state;
    },
  },
  {
    id: 'popcorn',
    name: '爆米花',
    cost: 5,
    rarity: 'common',
    description: '+20 倍率，每回合-4倍率',
    effect: (ctx) => {
      const val = ctx.jokerData?.popcorn_value ?? 20;
      ctx.mult += Math.max(0, val);
    },
    onRoundEnd: (state, joker) => {
      const current = joker.popcorn_value ?? 20;
      joker.popcorn_value = Math.max(0, current - 4);
      if (joker.popcorn_value <= 0) {
        state.jokers = state.jokers.filter(j => j.id !== joker.instanceId);
      }
      return state;
    },
  },
  {
    id: 'abstract_joker',
    name: '抽象小丑',
    cost: 4,
    rarity: 'common',
    description: '每张小丑牌 +3 倍率',
    effect: (ctx) => {
      ctx.mult += ctx.jokerCount * 3;
    },
  },
  {
    id: 'gros_michel',
    name: '大麦克',
    cost: 5,
    rarity: 'common',
    description: '+15 倍率，有1/6概率被摧毁',
    effect: (ctx) => {
      ctx.mult += 15;
    },
    onHandPlayed: (state, joker) => {
      if (Math.random() < 1 / 6) {
        state.jokers = state.jokers.filter(j => j.id !== joker.instanceId);
        state.scorePopups.push({ text: '摧毁!', x: 200, y: 100, color: '#e74c3c' });
      }
      return state;
    },
  },
  {
    id: 'even_steven',
    name: '偶数史蒂文',
    cost: 4,
    rarity: 'common',
    description: '打出的每张偶数牌 +4 倍率',
    effect: (ctx) => {
      const evens = ctx.playedCards.filter(c => c.rankValue % 2 === 0).length;
      ctx.mult += evens * 4;
    },
  },
  {
    id: 'odd_todd',
    name: '奇数托德',
    cost: 4,
    rarity: 'common',
    description: '打出的每张奇数牌 +4 倍率',
    effect: (ctx) => {
      const odds = ctx.playedCards.filter(c => c.rankValue % 2 === 1).length;
      ctx.mult += odds * 4;
    },
  },
  {
    id: 'scholar',
    name: '学者',
    cost: 4,
    rarity: 'common',
    description: '打出的每张A +20筹码 +4倍率',
    effect: (ctx) => {
      const aces = ctx.playedCards.filter(c => c.rank === 'A').length;
      ctx.chips += aces * 20;
      ctx.mult += aces * 4;
    },
  },
  {
    id: 'business_card',
    name: '名片',
    cost: 4,
    rarity: 'common',
    description: '打出的每张人头牌 1/2概率+2元',
    effect: (ctx) => {
      const faces = ctx.playedCards.filter(c => ['J', 'Q', 'K'].includes(c.rank));
      faces.forEach(() => {
        if (Math.random() < 0.5) ctx.moneyGain += 2;
      });
    },
  },
  {
    id: 'ride_the_bus',
    name: '搭公交',
    cost: 5,
    rarity: 'common',
    description: '连续不打出人头牌 +1倍率(可累积)',
    effect: (ctx) => {
      ctx.mult += ctx.jokerData?.bus_mult ?? 0;
    },
    onHandPlayed: (state, joker) => {
      const hasFace = state.playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank));
      if (!hasFace) {
        joker.bus_mult = (joker.bus_mult || 0) + 1;
      } else {
        joker.bus_mult = 0;
      }
      return state;
    },
  },
  {
    id: 'supernova',
    name: '超新星',
    cost: 5,
    rarity: 'common',
    description: '本局打出次数最多的牌型次数x1倍率',
    effect: (ctx) => {
      ctx.mult += ctx.jokerData?.supernova_mults ?? 0;
    },
    onHandPlayed: (state, joker) => {
      if (!joker.handCounts) joker.handCounts = {};
      const ht = state.handTypeText;
      if (ht) {
        joker.handCounts[ht] = (joker.handCounts[ht] || 0) + 1;
        joker.supernova_mults = Math.max(...Object.values(joker.handCounts));
      }
      return state;
    },
  },
  {
    id: 'blackboard',
    name: '黑板',
    cost: 6,
    rarity: 'uncommon',
    description: '手牌全为♠/♣时 x3 倍率',
    effect: (ctx) => {
      const allBlack = ctx.hand.every(c => c.suit === 'spades' || c.suit === 'clubs');
      if (allBlack && ctx.hand.length > 0) ctx.xMult *= 3;
    },
  },
  {
    id: 'constellation',
    name: '星座',
    cost: 6,
    rarity: 'uncommon',
    description: '每使用一张星球牌 +0.1x倍率',
    effect: (ctx) => {
      ctx.xMult *= (1 + (ctx.jokerData?.constellation_mult || 0));
    },
  },
  {
    id: 'hologram',
    name: '全息图',
    cost: 6,
    rarity: 'uncommon',
    description: '每添加一张牌到牌组 +0.25x倍率',
    effect: (ctx) => {
      ctx.xMult *= (1 + (ctx.jokerData?.hologram_mult || 0));
    },
  },
  {
    id: 'card_sharp',
    name: '纸牌高手',
    cost: 6,
    rarity: 'uncommon',
    description: '打出的每张♠/♣ x3 倍率',
    effect: (ctx) => {
      const blacks = ctx.playedCards.filter(c => c.suit === 'spades' || c.suit === 'clubs').length;
      ctx.xMult *= Math.pow(3, blacks);
    },
  },
  {
    id: 'the_trio',
    name: '三人组',
    cost: 7,
    rarity: 'uncommon',
    description: '含有三条时 x3 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'THREE_OF_A_KIND' || ctx.handType === 'FULL_HOUSE' ||
          ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.xMult *= 3;
      }
    },
  },
  {
    id: 'the_family',
    name: '家族',
    cost: 7,
    rarity: 'uncommon',
    description: '含有四条时 x4 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'FOUR_OF_A_KIND' || ctx.handType === 'FIVE_OF_A_KIND') {
        ctx.xMult *= 4;
      }
    },
  },
  {
    id: 'the_order',
    name: '秩序',
    cost: 7,
    rarity: 'uncommon',
    description: '含有顺子时 x3 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'STRAIGHT' || ctx.handType === 'STRAIGHT_FLUSH' || ctx.handType === 'ROYAL_FLUSH') {
        ctx.xMult *= 3;
      }
    },
  },
  {
    id: 'the_tribe',
    name: '部落',
    cost: 7,
    rarity: 'uncommon',
    description: '含有同花时 x2 倍率',
    effect: (ctx) => {
      if (ctx.handType === 'FLUSH' || ctx.handType === 'STRAIGHT_FLUSH' ||
          ctx.handType === 'ROYAL_FLUSH' || ctx.handType === 'FLUSH_HOUSE' || ctx.handType === 'FLUSH_FIVE') {
        ctx.xMult *= 2;
      }
    },
  },
  {
    id: 'stencil',
    name: '模板',
    cost: 7,
    rarity: 'uncommon',
    description: '空的小丑槽位每个 x1.5 倍率',
    effect: (ctx) => {
      const emptySlots = Math.max(0, ctx.maxJokers - ctx.jokerCount);
      ctx.xMult *= Math.pow(1.5, emptySlots);
    },
  },
  {
    id: 'throwback',
    name: '怀旧',
    cost: 6,
    rarity: 'uncommon',
    description: '跳过盲注 +0.25x倍率',
    effect: (ctx) => {
      ctx.xMult *= (1 + (ctx.jokerData?.throwback_mult || 0));
    },
  },
  {
    id: 'steel_joker',
    name: '钢铁小丑',
    cost: 7,
    rarity: 'uncommon',
    description: '牌组中每张钢铁牌 +0.2x倍率',
    effect: (ctx) => {
      const steelCount = ctx.fullDeck.filter(c => c.enhancement === 'STEEL').length;
      ctx.xMult *= (1 + steelCount * 0.2);
    },
  },
  {
    id: 'stone_joker',
    name: '石头小丑',
    cost: 6,
    rarity: 'uncommon',
    description: '牌组中每张石头牌 +25 筹码',
    effect: (ctx) => {
      const stoneCount = ctx.fullDeck.filter(c => c.enhancement === 'STONE').length;
      ctx.chips += stoneCount * 25;
    },
  },
  {
    id: 'fortune_teller',
    name: '占卜师',
    cost: 6,
    rarity: 'uncommon',
    description: '每使用一张塔罗牌 +1 倍率',
    effect: (ctx) => {
      ctx.mult += ctx.jokerData?.fortune_mult ?? 0;
    },
  },
  {
    id: 'bull',
    name: '公牛',
    cost: 6,
    rarity: 'uncommon',
    description: '每有1元 +2 筹码',
    effect: (ctx) => {
      ctx.chips += ctx.money * 2;
    },
  },
  {
    id: 'bootstraps',
    name: '自力更生',
    cost: 7,
    rarity: 'uncommon',
    description: '每有5元 +2 倍率',
    effect: (ctx) => {
      ctx.mult += Math.floor(ctx.money / 5) * 2;
    },
  },
  {
    id: 'ceremonial_dagger',
    name: '仪式匕首',
    cost: 7,
    rarity: 'uncommon',
    description: '出售右侧小丑时获得其出售价x2的倍率',
    effect: (ctx) => {
      ctx.mult += ctx.jokerData?.dagger_mult ?? 0;
    },
  },
  {
    id: 'cloud_9',
    name: '九霄云外',
    cost: 7,
    rarity: 'uncommon',
    description: '牌组中每张9 回合结束获得1元',
    effect: (ctx) => {},
    onRoundEnd: (state, joker) => {
      const nines = state.fullDeck.filter(c => c.rank === '9').length;
      state.money += nines;
      return state;
    },
  },
  {
    id: 'rocket',
    name: '火箭',
    cost: 7,
    rarity: 'uncommon',
    description: '回合结束获得2元',
    effect: (ctx) => {},
    onRoundEnd: (state, joker) => {
      const bonus = joker.rocket_bonus || 0;
      state.money += 2 + bonus;
      return state;
    },
  },
  {
    id: 'to_the_moon',
    name: '飞向月球',
    cost: 7,
    rarity: 'uncommon',
    description: '回合结束时每有1元额外获得1元利息(上限5元)',
    effect: (ctx) => {},
    onRoundEnd: (state, joker) => {
      const extra = Math.min(5, Math.floor(state.money));
      state.money += extra;
      return state;
    },
  },
  {
    id: 'golden_joker',
    name: '黄金小丑',
    cost: 6,
    rarity: 'common',
    description: '回合结束获得4元',
    effect: (ctx) => {},
    onRoundEnd: (state, joker) => {
      state.money += 4;
      return state;
    },
  },
  {
    id: 'pareidolia',
    name: '错视',
    cost: 5,
    rarity: 'uncommon',
    description: '所有牌视为人头牌',
    effect: (ctx) => {},
  },
  {
    id: 'smeared_joker',
    name: '模糊小丑',
    cost: 5,
    rarity: 'uncommon',
    description: '♥/♦视为同花色，♠/♣视为同花色',
    effect: (ctx) => {},
  },
  {
    id: 'hanging_chad',
    name: '查德挂饰',
    cost: 6,
    rarity: 'uncommon',
    description: '打出的第一张牌再触发2次',
    effect: (ctx) => {
      if (ctx.playedCards.length > 0) {
        const firstCard = ctx.playedCards[0];
        ctx.chips += getCardChips(firstCard) * 2;
      }
    },
  },
  {
    id: 'photograph',
    name: '照片',
    cost: 5,
    rarity: 'common',
    description: '第一张打出的人头牌 x2 倍率',
    effect: (ctx) => {
      const firstFace = ctx.playedCards.find(c => ['J', 'Q', 'K'].includes(c.rank));
      if (firstFace) ctx.xMult *= 2;
    },
  },
  {
    id: 'splash',
    name: '飞溅',
    cost: 4,
    rarity: 'common',
    description: '每张打出的牌都计分',
    effect: (ctx) => {
      const extra = ctx.playedCards.length - 5;
      if (extra > 0) {
        for (let i = 5; i < ctx.playedCards.length; i++) {
          ctx.chips += getCardChips(ctx.playedCards[i]);
        }
      }
    },
  },
];

function getCardChips(card) {
  if (card.enhancement === 'STONE') return 50;
  let chips = card.chipValue || 0;
  if (card.enhancement === 'BONUS') chips += 30;
  return chips;
}

export function getJokerDef(id) {
  return JOKER_DEFS.find(j => j.id === id);
}

export function getRandomJokers(count, excludeIds = []) {
  const available = JOKER_DEFS.filter(j => !excludeIds.includes(j.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(j => ({
    ...j,
    instanceId: `j_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }));
}

export function getShopJokers(count, ante) {
  const pool = JOKER_DEFS.filter(j => {
    if (j.rarity === 'common') return ante >= 1;
    if (j.rarity === 'uncommon') return ante >= 2;
    if (j.rarity === 'rare') return ante >= 4;
    return true;
  });
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(j => ({
    ...j,
    instanceId: `j_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }));
}

export default JOKER_DEFS;
