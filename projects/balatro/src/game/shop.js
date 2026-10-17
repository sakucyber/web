import { getShopJokers } from './jokers';

export function generateShop(ante, ownedJokerIds) {
  const jokers = getShopJokers(2, ante);
  const cards = generateShopCards(2);
  const vouchers = generateVouchers(1);
  return {
    jokers,
    cards,
    vouchers,
    rerollCost: 5,
  };
}

function generateShopCards(count) {
  const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const cards = [];
  for (let i = 0; i < count; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const enhancements = ['BASE', 'BASE', 'BASE', 'BONUS', 'MULT', 'WILD', 'GLASS', 'STEEL', 'STONE', 'GOLD', 'LUCKY'];
    const en = enhancements[Math.floor(Math.random() * enhancements.length)];
    cards.push({
      id: `shop_${Date.now()}_${i}`,
      suit,
      rank,
      enhancement: en,
      cost: 3 + Math.floor(Math.random() * 4),
    });
  }
  return cards;
}

function generateVouchers(count) {
  return [];
}
