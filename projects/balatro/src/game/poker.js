import { HAND_TYPES } from './constants';

export function evaluateHand(cards) {
  if (cards.length === 0) return null;
  if (cards.length > 5) return evaluateBestHand(cards);

  const suits = cards.map(c => c.suit);
  const values = cards.map(c => c.rankValue).sort((a, b) => b - a);

  const isFlush = suits.every(s => s === suits[0]);

  const isStraight = checkStraight(values);

  const counts = getRankCounts(values);
  const uniqueCounts = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    if (values[0] === 14 && values[1] === 13 && values[2] === 12 && values[3] === 11 && values[4] === 10) {
      return { type: 'ROYAL_FLUSH', ...HAND_TYPES.ROYAL_FLUSH };
    }
    return { type: 'STRAIGHT_FLUSH', ...HAND_TYPES.STRAIGHT_FLUSH };
  }

  if (uniqueCounts[0] === 5) return { type: 'FIVE_OF_A_KIND', ...HAND_TYPES.FIVE_OF_A_KIND };
  if (uniqueCounts[0] === 4) return { type: 'FOUR_OF_A_KIND', ...HAND_TYPES.FOUR_OF_A_KIND };
  if (uniqueCounts[0] === 3 && uniqueCounts[1] === 2) return { type: 'FULL_HOUSE', ...HAND_TYPES.FULL_HOUSE };
  if (isFlush) return { type: 'FLUSH', ...HAND_TYPES.FLUSH };
  if (isStraight) return { type: 'STRAIGHT', ...HAND_TYPES.STRAIGHT };
  if (uniqueCounts[0] === 3) return { type: 'THREE_OF_A_KIND', ...HAND_TYPES.THREE_OF_A_KIND };
  if (uniqueCounts[0] === 2 && uniqueCounts[1] === 2) return { type: 'TWO_PAIR', ...HAND_TYPES.TWO_PAIR };
  if (uniqueCounts[0] === 2) return { type: 'PAIR', ...HAND_TYPES.PAIR };

  return { type: 'HIGH_CARD', ...HAND_TYPES.HIGH_CARD };
}

function evaluateBestHand(cards) {
  const combinations = getCombinations(cards, 5);
  let bestResult = { type: 'HIGH_CARD', ...HAND_TYPES.HIGH_CARD };
  let bestScore = 0;

  for (const combo of combinations) {
    const result = evaluateHand(combo);
    const score = getHandRankScore(result.type);
    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  return bestResult;
}

function getHandRankScore(type) {
  const ranks = [
    'HIGH_CARD', 'PAIR', 'TWO_PAIR', 'THREE_OF_A_KIND',
    'STRAIGHT', 'FLUSH', 'FULL_HOUSE', 'FOUR_OF_A_KIND',
    'STRAIGHT_FLUSH', 'ROYAL_FLUSH', 'FIVE_OF_A_KIND',
    'FLUSH_HOUSE', 'FLUSH_FIVE',
  ];
  return ranks.indexOf(type);
}

function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function checkStraight(values) {
  const uniqueSorted = [...new Set(values)].sort((a, b) => b - a);
  if (uniqueSorted.length < 5) return false;

  for (let i = 0; i <= uniqueSorted.length - 5; i++) {
    if (uniqueSorted[i] - uniqueSorted[i + 4] === 4) return true;
  }

  if (uniqueSorted.includes(14) && uniqueSorted.includes(2) &&
      uniqueSorted.includes(3) && uniqueSorted.includes(4) && uniqueSorted.includes(5)) {
    return true;
  }

  return false;
}

function getRankCounts(values) {
  const counts = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  return counts;
}
