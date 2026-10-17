import { SUITS, RANKS } from './constants';

let cardIdCounter = 0;

export function createCard(suit, rank) {
  return {
    id: `card_${++cardIdCounter}`,
    suit: suit.id,
    suitSymbol: suit.symbol,
    suitColor: suit.color,
    rank: rank.id,
    rankValue: rank.value,
    chipValue: rank.chip,
    rankName: rank.name,
    enhancement: 'BASE',
    edition: 'BASE',
    seal: 'NONE',
    isFaceUp: true,
  };
}

export function createStandardDeck() {
  cardIdCounter = 0;
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawCards(deck, count) {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function getCardChips(card) {
  if (card.enhancement === 'STONE') return 50;
  let chips = card.chipValue;
  if (card.enhancement === 'BONUS') chips += 30;
  return chips;
}
