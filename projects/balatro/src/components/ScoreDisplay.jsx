import React, { useEffect, useState } from 'react';

export default function ScoreDisplay({ score, target }) {
  const [displayScore, setDisplayScore] = useState(0);
  const progress = target > 0 ? Math.min(100, (displayScore / target) * 100) : 0;

  useEffect(() => {
    if (score === displayScore) return;
    const diff = score - displayScore;
    const step = Math.max(1, Math.abs(Math.floor(diff / 30)));
    const timer = setInterval(() => {
      setDisplayScore(prev => {
        if (Math.abs(score - prev) <= step) {
          clearInterval(timer);
          return score;
        }
        return prev + (diff > 0 ? step : -step);
      });
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="score-display">
      <div className="score-bar-container">
        <div className="score-bar-bg" />
        <div
          className="score-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div className="score-bar-text">
          {displayScore.toLocaleString()} / {target.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
