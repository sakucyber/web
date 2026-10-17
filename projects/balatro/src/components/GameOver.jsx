import React from 'react';

export default function GameOver({ won, onRestart }) {
  return (
    <div className={`game-over-overlay ${won ? 'won' : 'lost'}`}>
      <div className="game-over-content">
        <div className="game-over-icon">{won ? '🏆' : '💀'}</div>
        <h1 className="game-over-title">{won ? '恭喜通关！' : '游戏结束'}</h1>
        <p className="game-over-sub">
          {won ? '你击败了所有盲注，完成了挑战！' : '分数未达标，盲注击败了你...'}
        </p>
        <button className="game-over-btn" onClick={onRestart}>
          再来一局
        </button>
      </div>
    </div>
  );
}
