import { evaluateHand } from './poker';
import { HAND_TYPES } from './constants';
import { getCardChips } from './cards';

export function calculateScore(state) {
  const { playedCards, handTypeText, handLevels, jokers, hand, discardsLeft, fullDeck, money } = state;

  if (playedCards.length === 0) return { chips: 0, mult: 0, score: 0, popups: [] };

  let bestHand;
  if (playedCards.length <= 5) {
    bestHand = evaluateHand(playedCards);
  } else {
    bestHand = evaluateHand(playedCards);
  }

  if (!bestHand) return { chips: 0, mult: 0, score: 0, popups: [] };

  const handType = bestHand.type;
  const handLevel = handLevels[handType] || 1;
  const handDef = HAND_TYPES[handType];

  let chips = handDef.baseChips + (handLevel - 1) * (handDef.baseChips > 50 ? 30 : 15);
  let mult = handDef.baseMult + (handLevel - 1) * (handDef.baseMult > 4 ? 2 : 1);
  let xMult = 1;

  for (const card of playedCards) {
    chips += getCardChips(card);
    if (card.enhancement === 'MULT') mult += 4;
    if (card.enhancement === 'GLASS') xMult *= 2;
    if (card.edition === 'FOIL') chips += 50;
    if (card.edition === 'HOLOGRAPHIC') mult += 10;
    if (card.edition === 'POLYCHROME') xMult *= 1.5;
  }

  const popups = [];
  let moneyGain = 0;

  const context = {
    playedCards,
    handType,
    hand,
    chips: 0,
    mult: 0,
    xMult: 1,
    discardsLeft,
    fullDeck,
    money,
    jokerCount: jokers.length,
    maxJokers: 5,
    moneyGain: 0,
  };

  for (const joker of jokers) {
    context.jokerData = joker;
    if (joker.effect) {
      joker.effect(context);
    }
    if (context.moneyGain > 0) {
      popups.push({ text: `+$${context.moneyGain}`, color: '#f1c40f', key: `money_${Math.random()}` });
      moneyGain += context.moneyGain;
      context.moneyGain = 0;
    }
  }

  chips += context.chips;
  mult += context.mult;
  xMult *= context.xMult;

  const totalScore = Math.floor(chips * mult * xMult);

  popups.unshift(
    { text: `${handDef.name}`, color: '#fff', key: 'handname' },
    { text: `${chips} × ${mult}`, color: '#3498db', key: 'base' }
  );

  return {
    chips: Math.floor(chips),
    mult,
    xMult,
    score: totalScore,
    handType,
    handName: handDef.name,
    popups,
    moneyGain,
  };
}

export function getHandTypeName(type) {
  return HAND_TYPES[type]?.name || '高牌';
}
