import React from 'react';
import Card from './Card';

export default function PlayedCards({ cards }) {
  if (!cards || cards.length === 0) {
    return <div className="played-cards-area empty" />;
  }

  return (
    <div className="played-cards-area">
      <div className="played-cards-row">
        {cards.map((card, i) => (
          <div
            key={card.id + '_' + i}
            className="played-card-slot"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <Card card={card} small index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
