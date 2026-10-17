import { INITIAL_STATE } from './constants';
import { createStandardDeck, shuffleDeck, drawCards } from './cards';
import { evaluateHand } from './poker';
import { calculateScore } from './scoring';
import { getBlindConfig } from './blinds';
import { generateShop } from './shop';

export function createInitialState() {
  const fullDeck = createStandardDeck();
  const shuffled = shuffleDeck(fullDeck);
  const { drawn: hand, remaining: drawPile } = drawCards(shuffled, 8);

  const blindConfig = getBlindConfig(1, 'small');

  return {
    ...INITIAL_STATE,
    fullDeck,
    hand,
    drawPile,
    blindTarget: blindConfig.target,
    blindName: blindConfig.name,
    blindEffect: blindConfig.effect || null,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_NEW_GAME': {
      return createInitialState();
    }

    case 'SELECT_BLIND': {
      const { blindType } = action;
      const config = getBlindConfig(state.ante, blindType);
      const shuffled = shuffleDeck(state.fullDeck);
      const { drawn: hand, remaining: drawPile } = drawCards(shuffled, state.handSize);

      let handsLeft = 4;
      let discardsLeft = 3;
      if (config.effect && config.effect.includes('弃牌')) discardsLeft = Math.max(0, discardsLeft - 1);
      if (config.effect && config.effect.includes('手牌')) handsLeft = Math.max(0, handsLeft - 1);

      return {
        ...state,
        phase: 'playing',
        blindType,
        blindName: config.name,
        blindTarget: config.target,
        blindEffect: config.effect || null,
        handsLeft,
        discardsLeft,
        hand,
        drawPile,
        playedCards: [],
        selectedCardIds: [],
        roundScore: 0,
        chips: 0,
        mult: 1,
        scoringDone: false,
        scorePopups: [],
        handTypeText: '',
      };
    }

    case 'TOGGLE_CARD_SELECT': {
      const cardId = action.cardId;
      if (state.phase !== 'playing') return state;
      const selected = state.selectedCardIds.includes(cardId)
        ? state.selectedCardIds.filter(id => id !== cardId)
        : [...state.selectedCardIds, cardId];
      return { ...state, selectedCardIds: selected };
    }

    case 'PLAY_HAND': {
      if (state.phase !== 'playing' || state.handsLeft <= 0) return state;
      const playedCards = state.hand.filter(c => state.selectedCardIds.includes(c.id));
      if (playedCards.length === 0) return state;
      if (playedCards.length > 5) return state;

      const handEval = evaluateHand(playedCards);
      if (!handEval) return state;

      const remainingHand = state.hand.filter(c => !state.selectedCardIds.includes(c.id));
      const cardsNeeded = state.handSize - remainingHand.length;
      const { drawn, remaining: newDrawPile } = drawCards(state.drawPile, cardsNeeded);
      const newHand = [...remainingHand, ...drawn];

      const scoreContext = {
        ...state,
        playedCards,
        handTypeText: handEval.type,
        drawPile: newDrawPile,
      };

      const result = calculateScore(scoreContext);
      const newRoundScore = state.roundScore + result.score;
      const scoringDone = newRoundScore >= state.blindTarget;
      const newHandsLeft = state.handsLeft - 1;

      let newPhase = state.phase;
      if (scoringDone) newPhase = 'round_win';
      else if (newHandsLeft <= 0) newPhase = 'round_lose';

      let updatedJokers = [...state.jokers];
      let updatedState = { ...state, jokers: updatedJokers };

      for (const joker of updatedJokers) {
        if (joker.onHandPlayed) {
          const tempState = { ...updatedState, playedCards };
          updatedState = joker.onHandPlayed(tempState, joker);
        }
      }

      return {
        ...updatedState,
        phase: newPhase,
        hand: newHand,
        drawPile: newDrawPile,
        playedCards,
        selectedCardIds: [],
        handsLeft: newHandsLeft,
        roundScore: newRoundScore,
        chips: result.chips,
        mult: result.mult,
        money: state.money + (result.moneyGain || 0),
        handTypeText: result.handName,
        scoringDone,
        scorePopups: result.popups || [],
      };
    }

    case 'DISCARD': {
      if (state.phase !== 'playing' || state.discardsLeft <= 0) return state;
      const discardCards = state.hand.filter(c => state.selectedCardIds.includes(c.id));
      if (discardCards.length === 0) return state;

      const remainingHand = state.hand.filter(c => !state.selectedCardIds.includes(c.id));
      const { drawn, remaining: newDrawPile } = drawCards(state.drawPile, discardCards.length);
      const newHand = [...remainingHand, ...drawn];

      return {
        ...state,
        hand: newHand,
        drawPile: newDrawPile,
        selectedCardIds: [],
        discardsLeft: state.discardsLeft - 1,
        scorePopups: [{ text: `弃牌 ${discardCards.length}张`, color: '#95a5a6', key: `discard_${Date.now()}` }],
      };
    }

    case 'PROCEED_TO_SHOP': {
      let finalState = { ...state };

      for (const joker of state.jokers) {
        if (joker.onRoundEnd) {
          finalState = joker.onRoundEnd(finalState, joker);
        }
      }

      let moneyAfterRound = finalState.money;

      if (state.scoringDone) {
        const blindConfig = getBlindConfig(state.ante, state.blindType);
        const blindReward = blindConfig.reward || 3;
        const handsBonus = state.handsLeft;
        const interest = Math.min(5, Math.floor(moneyAfterRound / 5));
        moneyAfterRound += blindReward + handsBonus + interest;
      }

      const shopData = generateShop(state.ante, state.jokers.map(j => j.id));
      const shopItems = [
        ...shopData.jokers.map(j => ({ ...j, type: 'joker' })),
        ...shopData.cards.map(c => ({ ...c, type: 'card' })),
      ];

      return {
        ...finalState,
        phase: 'shop',
        money: moneyAfterRound,
        shopItems,
        shopRerollCost: 5,
        selectedCardIds: [],
        scorePopups: [],
      };
    }

    case 'SKIP_BLIND': {
      let updatedState = { ...state };

      for (const joker of state.jokers) {
        if (joker.onRoundEnd) {
          updatedState = joker.onRoundEnd(updatedState, joker);
        }
      }

      const interest = Math.min(5, Math.floor(updatedState.money / 5));
      const nextAnte = state.blindType === 'boss' ? state.ante + 1 : state.ante;
      const nextType = state.blindType === 'small' ? 'big' : state.blindType === 'big' ? 'boss' : 'small';
      const config = getBlindConfig(nextAnte, nextType);

      return {
        ...updatedState,
        ante: nextAnte,
        blindType: nextType,
        blindName: config.name,
        blindTarget: config.target,
        blindEffect: config.effect || null,
        phase: 'blind_select',
        money: updatedState.money + interest,
        scorePopups: [],
      };
    }

    case 'BUY_JOKER': {
      const item = action.item;
      if (state.money < item.cost) return state;
      if (state.jokers.length >= 7) return state;

      const newJoker = {
        ...item,
        instanceId: `j_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };

      return {
        ...state,
        money: state.money - item.cost,
        jokers: [...state.jokers, newJoker],
        shopItems: state.shopItems.filter(i => i.instanceId !== item.instanceId),
        scorePopups: [{ text: `购买: ${item.name}`, color: '#2ecc71', key: `buy_${Date.now()}` }],
      };
    }

    case 'BUY_CARD': {
      const item = action.item;
      if (state.money < item.cost) return state;

      const { drawn: [newCard], remaining: newDrawPile } = drawCards([{
        id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        suit: item.suit,
        suitSymbol: { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }[item.suit],
        suitColor: { spades: '#c8d6e5', hearts: '#e74c3c', clubs: '#27ae60', diamonds: '#e67e22' }[item.suit],
        rank: item.rank,
        rankValue: { A: 14, K: 13, Q: 12, J: 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }[item.rank],
        chipValue: { A: 11, K: 10, Q: 10, J: 10, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }[item.rank],
        rankName: item.rank,
        enhancement: item.enhancement || 'BASE',
        edition: 'BASE',
        seal: 'NONE',
        isFaceUp: true,
      }], 1);

      return {
        ...state,
        money: state.money - item.cost,
        fullDeck: [...state.fullDeck, newCard],
        shopItems: state.shopItems.filter(i => i.id !== item.id),
        scorePopups: [{ text: `购买: 卡片`, color: '#2ecc71', key: `buy_${Date.now()}` }],
      };
    }

    case 'REROLL_SHOP': {
      if (state.money < state.shopRerollCost) return state;
      const shopData = generateShop(state.ante, state.jokers.map(j => j.id));
      const shopItems = [
        ...shopData.jokers.map(j => ({ ...j, type: 'joker' })),
        ...shopData.cards.map(c => ({ ...c, type: 'card' })),
      ];
      return {
        ...state,
        money: state.money - state.shopRerollCost,
        shopItems,
        shopRerollCost: state.shopRerollCost + 2,
      };
    }

    case 'SELL_JOKER': {
      const joker = action.joker;
      const sellPrice = joker.sellCost || Math.ceil(joker.cost / 2);
      return {
        ...state,
        money: state.money + sellPrice,
        jokers: state.jokers.filter(j => j.instanceId !== joker.instanceId),
        scorePopups: [{ text: `出售: +$${sellPrice}`, color: '#f39c12', key: `sell_${Date.now()}` }],
      };
    }

    case 'NEXT_ROUND': {
      let nextAnte = state.ante;
      let nextType = state.blindType;

      if (state.blindType === 'boss') {
        nextAnte++;
        nextType = 'small';
      } else if (state.blindType === 'small') {
        nextType = 'big';
      } else if (state.blindType === 'big') {
        nextType = 'boss';
      }

      if (nextAnte > 8 && nextType === 'boss') {
        return { ...state, phase: 'win' };
      }

      const config = getBlindConfig(nextAnte, nextType);
      const shuffled = shuffleDeck(state.fullDeck);
      const { drawn: hand, remaining: drawPile } = drawCards(shuffled, state.handSize);

      return {
        ...state,
        phase: 'blind_select',
        ante: nextAnte,
        blindType: nextType,
        blindName: config.name,
        blindTarget: config.target,
        blindEffect: config.effect || null,
        hand,
        drawPile,
        playedCards: [],
        selectedCardIds: [],
        roundScore: 0,
        chips: 0,
        mult: 1,
        scoringDone: false,
        scorePopups: [],
        handTypeText: '',
        handsLeft: 4,
        discardsLeft: 3,
        shopItems: [],
      };
    }

    case 'CLEAR_POPUPS': {
      return { ...state, scorePopups: [] };
    }

    default:
      return state;
  }
}
