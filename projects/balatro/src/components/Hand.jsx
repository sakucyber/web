import React, { useState, useEffect } from 'react';
import { useGame } from '../App';
import Card from './Card';

export default function Hand() {
  const { state, toggleCardSelect } = useGame();
  const { hand, selectedCardIds, phase } = state;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!hand || hand.length === 0) return null;

  const maxCards = hand.length;
  const cardWidth = 80;
  const gap = 12;
  const totalWidth = maxCards * cardWidth + (maxCards - 1) * gap;
  const containerWidth = Math.min(windowWidth - 60, 900);
  const scale = Math.min(1, containerWidth / Math.max(totalWidth, 1));
  const actualGap = gap * scale;

  return (
    <div className="hand-container">
      <div className="hand-cards" style={{ justifyContent: 'center' }}>
        {hand.map((card, i) => {
          const isSelected = selectedCardIds.includes(card.id);
          const offsetY = isSelected ? -20 : 0;
          return (
            <div
              key={card.id}
              className="hand-card-wrapper"
              style={{
                transform: `translateY(${offsetY}px)`,
                marginLeft: i > 0 ? `${actualGap - (1 - scale) * 80}px` : '0',
                zIndex: isSelected ? 100 : 1,
                transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <Card
                card={card}
                isSelected={isSelected}
                onClick={() => phase === 'playing' ? toggleCardSelect(card.id) : null}
                index={i}
                animDelay={0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
