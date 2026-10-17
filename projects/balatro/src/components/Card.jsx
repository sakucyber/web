import React from 'react';
import { useGame } from '../App';

function getSuitSymbol(suit) {
  return { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }[suit] || '?';
}

function getSuitColor(suit) {
  return { spades: '#c8d6e5', hearts: '#e74c3c', clubs: '#27ae60', diamonds: '#e67e22' }[suit] || '#fff';
}

function getEnhancementClass(enhancement) {
  if (enhancement === 'BASE') return '';
  return `card-enhanced-${enhancement.toLowerCase()}`;
}

export default function Card({ card, isSelected, onClick, small, index = 0, animDelay = 0 }) {
  if (!card) return null;
  const suitColor = card.suitColor || getSuitColor(card.suit);
  const symbol = card.suitSymbol || getSuitSymbol(card.suit);
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const displayColor = isRed ? '#e74c3c' : '#c8d6e5';

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''} ${getEnhancementClass(card.enhancement)} ${small ? 'card-small' : ''}`}
      onClick={onClick}
      style={{
        animationDelay: `${index * 0.08 + animDelay}s`,
        zIndex: isSelected ? 10 : 1,
      }}
    >
      <div className="card-inner">
        <div className="card-corner top-left">
          <span className="card-rank" style={{ color: displayColor }}>{card.rankName || card.rank}</span>
          <span className="card-suit" style={{ color: suitColor }}>{symbol}</span>
        </div>

        <div className="card-center-suit" style={{ color: suitColor }}>
          {symbol}
        </div>

        <div className="card-corner bottom-right">
          <span className="card-suit" style={{ color: suitColor }}>{symbol}</span>
          <span className="card-rank" style={{ color: displayColor }}>{card.rankName || card.rank}</span>
        </div>

        {card.enhancement && card.enhancement !== 'BASE' && (
          <div className="card-enhancement-label">
            {card.enhancement === 'BONUS' && '+30'}
            {card.enhancement === 'MULT' && '+4'}
            {card.enhancement === 'WILD' && 'W'}
            {card.enhancement === 'GLASS' && 'x2'}
            {card.enhancement === 'STEEL' && 'x1.5'}
            {card.enhancement === 'STONE' && '50'}
            {card.enhancement === 'GOLD' && '$'}
            {card.enhancement === 'LUCKY' && '?'}
          </div>
        )}

        {card.edition && card.edition !== 'BASE' && (
          <div className={`card-edition-glow ${card.edition.toLowerCase()}`} />
        )}
      </div>
    </div>
  );
}
