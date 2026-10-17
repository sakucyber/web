import React from 'react';

const BLIND_COLORS = {
  small: '#3498db',
  big: '#e67e22',
  boss: '#e74c3c',
};

export default function BlindInfo({ blindName, blindTarget, roundScore, blindEffect, blindType }) {
  const progress = blindTarget > 0 ? Math.min(100, (roundScore / blindTarget) * 100) : 0;
  const color = BLIND_COLORS[blindType] || '#3498db';

  return (
    <div className="blind-info">
      <div className="blind-name" style={{ color }}>
        {blindName || '小盲注'}
      </div>
      <div className="blind-target">
        {blindTarget ? blindTarget.toLocaleString() : '---'}
      </div>
      <div className="blind-progress-mini">
        <div
          className="blind-progress-fill"
          style={{ width: `${progress}%`, background: color }}
        />
      </div>
      {blindEffect && (
        <div className="blind-effect" style={{ color: '#e74c3c' }}>
          {blindEffect}
        </div>
      )}
    </div>
  );
}
