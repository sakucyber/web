export const SUITS = [
  { id: 'spades', symbol: '♠', color: '#c8d6e5', name: '黑桃' },
  { id: 'hearts', symbol: '♥', color: '#e74c3c', name: '红心' },
  { id: 'clubs', symbol: '♣', color: '#27ae60', name: '梅花' },
  { id: 'diamonds', symbol: '♦', color: '#e67e22', name: '方块' },
];

export const RANKS = [
  { id: '2', value: 2, chip: 2, name: '2' },
  { id: '3', value: 3, chip: 3, name: '3' },
  { id: '4', value: 4, chip: 4, name: '4' },
  { id: '5', value: 5, chip: 5, name: '5' },
  { id: '6', value: 6, chip: 6, name: '6' },
  { id: '7', value: 7, chip: 7, name: '7' },
  { id: '8', value: 8, chip: 8, name: '8' },
  { id: '9', value: 9, chip: 9, name: '9' },
  { id: '10', value: 10, chip: 10, name: '10' },
  { id: 'J', value: 11, chip: 10, name: 'J' },
  { id: 'Q', value: 12, chip: 10, name: 'Q' },
  { id: 'K', value: 13, chip: 10, name: 'K' },
  { id: 'A', value: 14, chip: 11, name: 'A' },
];

export const HAND_TYPES = {
  HIGH_CARD: { name: '高牌', baseChips: 5, baseMult: 1, level: 1 },
  PAIR: { name: '一对', baseChips: 10, baseMult: 2, level: 1 },
  TWO_PAIR: { name: '两对', baseChips: 20, baseMult: 2, level: 1 },
  THREE_OF_A_KIND: { name: '三条', baseChips: 30, baseMult: 3, level: 1 },
  STRAIGHT: { name: '顺子', baseChips: 30, baseMult: 4, level: 1 },
  FLUSH: { name: '同花', baseChips: 35, baseMult: 4, level: 1 },
  FULL_HOUSE: { name: '葫芦', baseChips: 40, baseMult: 4, level: 1 },
  FOUR_OF_A_KIND: { name: '四条', baseChips: 60, baseMult: 7, level: 1 },
  STRAIGHT_FLUSH: { name: '同花顺', baseChips: 100, baseMult: 8, level: 1 },
  ROYAL_FLUSH: { name: '皇家同花顺', baseChips: 100, baseMult: 8, level: 1 },
  FIVE_OF_A_KIND: { name: '五条', baseChips: 120, baseMult: 12, level: 1 },
  FLUSH_HOUSE: { name: '同花葫芦', baseChips: 140, baseMult: 14, level: 1 },
  FLUSH_FIVE: { name: '同花五条', baseChips: 160, baseMult: 16, level: 1 },
};

export const EDITIONS = {
  BASE: { name: '基础', mult: 0, chips: 0 },
  FOIL: { name: '闪箔', mult: 0, chips: 50 },
  HOLOGRAPHIC: { name: '全息', mult: 10, chips: 0 },
  POLYCHROME: { name: '多彩', mult: 0, chips: 0, xMult: 1.5 },
  NEGATIVE: { name: '负片', mult: 0, chips: 0, extraSlot: true },
};

export const ENHANCEMENTS = {
  BASE: { name: '基础', chips: 0, mult: 0 },
  BONUS: { name: '奖励', chips: 30, mult: 0 },
  MULT: { name: '倍率', chips: 0, mult: 4 },
  WILD: { name: '万能', chips: 0, mult: 0, wild: true },
  GLASS: { name: '玻璃', chips: 0, mult: 0, xMult: 2, breakChance: 0.25 },
  STEEL: { name: '钢铁', chips: 0, mult: 0, xMult: 1.5, heldInHand: true },
  STONE: { name: '石头', chips: 50, mult: 0, noRankSuit: true },
  GOLD: { name: '黄金', chips: 0, mult: 0, goldBonus: 3 },
  LUCKY: { name: '幸运', chips: 0, mult: 0, luckyChips: 20, luckyMult: 20, luckyChance: 0.05 },
};

export const SEALS = {
  NONE: { name: '无' },
  RED: { name: '红色蜡封', retrigger: true },
  BLUE: { name: '蓝色蜡封', planetOnSell: true },
  GOLD: { name: '金色蜡封', moneyOnSell: 3 },
  PURPLE: { name: '紫色蜡封', tarotOnDiscard: true },
};

export const INITIAL_STATE = {
  phase: 'blind_select',
  ante: 1,
  blindType: 'small',
  blindName: '小盲注',
  blindTarget: 300,
  handsLeft: 4,
  discardsLeft: 3,
  handSize: 8,
  money: 4,
  roundScore: 0,
  chips: 0,
  mult: 1,
  handLevels: {
    HIGH_CARD: 1, PAIR: 1, TWO_PAIR: 1, THREE_OF_A_KIND: 1,
    STRAIGHT: 1, FLUSH: 1, FULL_HOUSE: 1, FOUR_OF_A_KIND: 1,
    STRAIGHT_FLUSH: 1, ROYAL_FLUSH: 1, FIVE_OF_A_KIND: 1,
    FLUSH_HOUSE: 1, FLUSH_FIVE: 1,
  },
  handTypeText: '',
  scoringDone: false,
  selectedCardIds: [],
  playedCards: [],
  fullDeck: [],
  hand: [],
  jokers: [],
  consumables: [],
  shopItems: [],
  shopRerollCost: 5,
  scorePopups: [],
};
