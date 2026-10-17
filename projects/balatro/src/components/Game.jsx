import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../App';
import { evaluateHand } from '../game/poker';
import Hand from './Hand';
import PlayedCards from './PlayedCards';
import JokerArea from './JokerArea';
import ScoreDisplay from './ScoreDisplay';
import BlindInfo from './BlindInfo';
import RoundInfo from './RoundInfo';
import ShopPanel from './ShopPanel';
import ScorePopups from './ScorePopups';
import GameOver from './GameOver';

export default function Game() {
  const { state, startNewGame, selectBlind, playHand, discard, proceedToShop, skipBlind, nextRound, clearPopups } = useGame();
  const [showTitle, setShowTitle] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (state.phase === 'playing') {
      const t = setTimeout(() => clearPopups(), 2000);
      return () => clearTimeout(t);
    }
  }, [state.scorePopups, clearPopups, state.phase]);

  const selectedCards = state.hand.filter(c => state.selectedCardIds.includes(c.id));
  const handPreview = selectedCards.length > 0 && selectedCards.length <= 5
    ? evaluateHand(selectedCards)
    : null;

  function handlePlay() {
    if (state.selectedCardIds.length === 0) return;
    if (state.selectedCardIds.length > 5) return;
    playHand();
  }

  function handleDiscard() {
    if (state.selectedCardIds.length === 0) return;
    discard();
  }

  if (showTitle) {
    return <TitleScreen onStart={() => { setShowTitle(false); startNewGame(); }} />;
  }

  if (state.phase === 'win') {
    return <GameOver won={true} onRestart={() => { startNewGame(); }} />;
  }

  if (state.phase === 'round_lose') {
    return <GameOver won={false} onRestart={() => { startNewGame(); }} />;
  }

  return (
    <div className="game-container">
      <div className="game-bg" />

      {state.phase === 'blind_select' && (
        <BlindSelect
          ante={state.ante}
          onSelect={selectBlind}
          onSkip={skipBlind}
        />
      )}

      <div className="game-top-bar">
        <div className="game-top-left">
          <div className="game-title-small">小丑牌</div>
        </div>
        <div className="game-top-center">
          <BlindInfo
            blindName={state.blindName}
            blindTarget={state.blindTarget}
            roundScore={state.roundScore}
            blindEffect={state.blindEffect}
          />
        </div>
        <div className="game-top-right">
          <RoundInfo
            handsLeft={state.handsLeft}
            discardsLeft={state.discardsLeft}
            money={state.money}
            ante={state.ante}
          />
        </div>
      </div>

      <div className="game-joker-area">
        <JokerArea jokers={state.jokers} />
      </div>

      <div className="game-center">
        <PlayedCards cards={state.playedCards} />
        {handPreview && state.phase === 'playing' && (
          <div className="hand-preview">
            {handPreview.name}
            <span className="hand-preview-score">
              ({handPreview.baseChips}筹码 × {handPreview.baseMult}倍率)
            </span>
          </div>
        )}
        {state.phase === 'playing' && (
          <div className="game-controls">
            <button
              className={`btn-play ${state.selectedCardIds.length > 0 && state.selectedCardIds.length <= 5 ? 'active' : ''}`}
              onClick={handlePlay}
              disabled={state.selectedCardIds.length === 0 || state.selectedCardIds.length > 5}
            >
              出牌
            </button>
            <button
              className={`btn-discard ${state.selectedCardIds.length > 0 ? 'active' : ''}`}
              onClick={handleDiscard}
              disabled={state.selectedCardIds.length === 0 || state.discardsLeft <= 0}
            >
              弃牌 ({state.discardsLeft})
            </button>
          </div>
        )}
        {state.phase === 'round_win' && (
          <div className="game-controls">
            <div className="round-win-text">✓ 盲注达成!</div>
            <button className="btn-play active" onClick={proceedToShop}>
              进入商店
            </button>
          </div>
        )}
        <ScoreDisplay score={state.roundScore} target={state.blindTarget} />
      </div>

      <div className="game-hand-area">
        <Hand
          cards={state.hand}
          selectedIds={state.selectedCardIds}
          phase={state.phase}
        />
      </div>

      <ScorePopups popups={state.scorePopups} />

      {state.phase === 'shop' && <ShopPanel />}
    </div>
  );
}

function TitleScreen({ onStart }) {
  return (
    <div className="title-screen">
      <div className="title-screen-bg" />
      <div className="title-content">
        <div className="title-icon">🃏</div>
        <h1 className="title-text">小丑牌</h1>
        <p className="title-sub">BALATRO</p>
        <div className="title-flavor">一副扑克牌，无限可能性</div>
        <button className="title-start-btn" onClick={onStart}>
          开始游戏
        </button>
        <div className="title-hint">选择要打出的牌（最多5张），达成盲注目标分数</div>
      </div>
    </div>
  );
}

function BlindSelect({ ante, onSelect, onSkip }) {
  const blinds = [
    { type: 'small', name: '小盲注', color: '#3498db' },
    { type: 'big', name: '大盲注', color: '#e67e22' },
    { type: 'boss', name: 'Boss盲注', color: '#e74c3c' },
  ];

  return (
    <div className="blind-select-overlay">
      <div className="blind-select-content">
        <h2 className="blind-select-title">第 {ante} 轮</h2>
        <p className="blind-select-desc">选择盲注</p>
        <div className="blind-select-options">
          {blinds.map((b) => (
            <button
              key={b.type}
              className={`blind-select-btn ${b.type}`}
              onClick={() => onSelect(b.type)}
            >
              <span className="blind-btn-name">{b.name}</span>
              <span className="blind-btn-type">{b.type === 'boss' ? '⚠ Boss' : ''}</span>
            </button>
          ))}
        </div>
        <button className="blind-skip-btn" onClick={onSkip}>
          跳过盲注
        </button>
      </div>
    </div>
  );
}
