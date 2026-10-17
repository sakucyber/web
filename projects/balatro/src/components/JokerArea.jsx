import React, { useState } from 'react';
import { useGame } from '../App';

const JOKER_ICONS = {
  joker: '🃏',
  greedy_joker: '♦',
  lusty_joker: '♥',
  wrathful_joker: '♠',
  gluttonous_joker: '♣',
  jolly_joker: '😊',
  zany_joker: '🤪',
  mad_joker: '😡',
  crazy_joker: '🤯',
  droll_joker: '😏',
  sly_joker: '🦊',
  wily_joker: '🐺',
  clever_joker: '🦉',
  devious_joker: '🐍',
  crafty_joker: '🦅',
  half_joker: '½',
  banner: '🏳',
  mystic_summit: '🏔',
  misprint: '🖨',
  ice_cream: '🍦',
  popcorn: '🍿',
  abstract_joker: '🎨',
  gros_michel: '🍌',
  even_steven: '2️⃣',
  odd_todd: '1️⃣',
  scholar: '📚',
  business_card: '💳',
  ride_the_bus: '🚌',
  supernova: '💥',
  blackboard: '🖤',
  constellation: '✨',
  hologram: '🌈',
  card_sharp: '🗡',
  the_trio: '3️⃣',
  the_family: '4️⃣',
  the_order: '📏',
  the_tribe: '👥',
  stencil: '📐',
  throwback: '⏪',
  steel_joker: '🛡',
  stone_joker: '🪨',
  fortune_teller: '🔮',
  bull: '🐂',
  bootstraps: '👢',
  ceremonial_dagger: '🗡',
  cloud_9: '☁',
  rocket: '🚀',
  to_the_moon: '🌙',
  golden_joker: '🪙',
  pareidolia: '👁',
  smeared_joker: '🎨',
  hanging_chad: '📎',
  photograph: '📷',
  splash: '💦',
};

export default function JokerArea() {
  const { state, sellJoker } = useGame();
  const { jokers } = state;
  const [activeJoker, setActiveJoker] = useState(null);

  const slots = Array(7).fill(null);
  jokers.forEach((j, i) => {
    if (i < 7) slots[i] = j;
  });

  return (
    <div className="joker-area">
      <div className="joker-slots">
        {slots.map((joker, i) => (
          <div
            key={i}
            className={`joker-slot ${joker ? 'filled' : 'empty'} ${activeJoker === i ? 'active' : ''}`}
            onClick={() => {
              if (joker) {
                setActiveJoker(activeJoker === i ? null : i);
              }
            }}
          >
            {joker ? (
              <div className="joker-card">
                <div className="joker-icon">{JOKER_ICONS[joker.id] || '🃏'}</div>
                <div className="joker-name">{joker.name}</div>
                <div className="joker-desc">{joker.description}</div>
                {joker.rarity && (
                  <div className={`joker-rarity ${joker.rarity}`}>
                    {joker.rarity === 'uncommon' ? '非凡' : joker.rarity === 'rare' ? '稀有' : '普通'}
                  </div>
                )}
                {joker.bus_mult > 0 && <div className="joker-extra">+{joker.bus_mult}倍</div>}
                {joker.popcorn_value > 0 && <div className="joker-extra">{joker.popcorn_value}倍</div>}
                {joker.ice_cream_value > 0 && <div className="joker-extra">{joker.ice_cream_value}筹</div>}
              </div>
            ) : (
              <div className="joker-empty-slot">空</div>
            )}
            {joker && activeJoker === i && (
              <button
                className="joker-sell-btn"
                onClick={(e) => { e.stopPropagation(); sellJoker(joker); setActiveJoker(null); }}
              >
                出售 ${joker.sellCost || Math.ceil(joker.cost / 2)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
