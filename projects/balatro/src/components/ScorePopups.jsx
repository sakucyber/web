import React, { useEffect, useState } from 'react';

export default function ScorePopups({ popups }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(popups || []);
    if (popups && popups.length > 0) {
      const timer = setTimeout(() => setItems([]), 2500);
      return () => clearTimeout(timer);
    }
  }, [popups]);

  return (
    <div className="score-popups-container">
      {items.map((popup, i) => (
        <div
          key={popup.key || i}
          className="score-popup"
          style={{
            color: popup.color || '#fff',
            animationDelay: `${i * 0.15}s`,
          }}
        >
          {popup.text}
        </div>
      ))}
    </div>
  );
}
