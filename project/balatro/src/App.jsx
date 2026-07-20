import React, { useReducer, useMemo } from 'react';
import { gameReducer, createInitialState } from './game/reducer';
import Game from './components/Game';

const GameContext = React.createContext(null);

export function useGame() {
  return React.useContext(GameContext);
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const actions = useMemo(() => ({
    startNewGame: () => dispatch({ type: 'START_NEW_GAME' }),
    selectBlind: (blindType) => dispatch({ type: 'SELECT_BLIND', blindType }),
    toggleCardSelect: (cardId) => dispatch({ type: 'TOGGLE_CARD_SELECT', cardId }),
    playHand: () => dispatch({ type: 'PLAY_HAND' }),
    discard: () => dispatch({ type: 'DISCARD' }),
    proceedToShop: () => dispatch({ type: 'PROCEED_TO_SHOP' }),
    skipBlind: () => dispatch({ type: 'SKIP_BLIND' }),
    buyJoker: (item) => dispatch({ type: 'BUY_JOKER', item }),
    buyCard: (item) => dispatch({ type: 'BUY_CARD', item }),
    rerollShop: () => dispatch({ type: 'REROLL_SHOP' }),
    sellJoker: (joker) => dispatch({ type: 'SELL_JOKER', joker }),
    nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
    clearPopups: () => dispatch({ type: 'CLEAR_POPUPS' }),
  }), [dispatch]);

  return (
    <GameContext.Provider value={{ state, dispatch, ...actions }}>
      <Game />
    </GameContext.Provider>
  );
}
