import React from 'react';

export default function RoundInfo({ handsLeft, discardsLeft, money, ante }) {
  return (
    <div className="round-info">
      <div className="round-stat">
        <span className="round-label">回合</span>
        <span className="round-value">{ante}</span>
      </div>
      <div className="round-stat">
        <span className="round-label">手牌</span>
        <span className="round-value hands">{handsLeft}</span>
      </div>
      <div className="round-stat">
        <span className="round-label">弃牌</span>
        <span className="round-value discards">{discardsLeft}</span>
      </div>
      <div className="round-stat money-stat">
        <span className="round-label">金钱</span>
        <span className="round-value money">${money}</span>
      </div>
    </div>
  );
}
