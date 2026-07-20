import React from 'react';
import { useGame } from '../App';
import Card from './Card';

export default function ShopPanel() {
  const { state, buyJoker, buyCard, rerollShop, nextRound } = useGame();
  const { shopItems, money, shopRerollCost } = state;

  return (
    <div className="shop-overlay">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>商店</h2>
          <span className="shop-money">💰 ${money}</span>
        </div>

        <div className="shop-items">
          {shopItems.map((item, i) => (
            <div key={item.instanceId || item.id || i} className="shop-item">
              {item.type === 'joker' ? (
                <div className="shop-joker-card">
                  <div className="shop-joker-name">{item.name}</div>
                  <div className="shop-joker-desc">{item.description}</div>
                  <div className={`shop-joker-rarity ${item.rarity}`}>{item.rarity}</div>
                  <div className="shop-item-cost">${item.cost}</div>
                  <button
                    className={`shop-buy-btn ${money >= item.cost && state.jokers.length < 7 ? '' : 'disabled'}`}
                    onClick={() => money >= item.cost && state.jokers.length < 7 ? buyJoker(item) : null}
                    disabled={money < item.cost || state.jokers.length >= 7}
                  >
                    购买
                  </button>
                </div>
              ) : (
                <div className="shop-card-item">
                  <Card card={{
                    id: item.id,
                    suit: item.suit,
                    rank: item.rank,
                    rankName: item.rank,
                    rankValue: { A: 14, K: 13, Q: 12, J: 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }[item.rank],
                    chipValue: { A: 11, K: 10, Q: 10, J: 10, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }[item.rank],
                    suitSymbol: { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }[item.suit],
                    suitColor: { spades: '#c8d6e5', hearts: '#e74c3c', clubs: '#27ae60', diamonds: '#e67e22' }[item.suit],
                    enhancement: item.enhancement || 'BASE',
                    edition: 'BASE',
                    seal: 'NONE',
                  }} small />
                  <div className="shop-item-cost">${item.cost}</div>
                  <button
                    className={`shop-buy-btn ${money >= item.cost ? '' : 'disabled'}`}
                    onClick={() => money >= item.cost ? buyCard(item) : null}
                    disabled={money < item.cost}
                  >
                    购买
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="shop-actions">
          <button
            className="shop-reroll-btn"
            onClick={rerollShop}
            disabled={money < shopRerollCost}
          >
            刷新 (${shopRerollCost})
          </button>
          <button className="shop-next-btn" onClick={nextRound}>
            下一局
          </button>
        </div>
      </div>
    </div>
  );
}
