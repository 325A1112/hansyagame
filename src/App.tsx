import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GameCanvas } from './components/GameCanvas';
import { ResultCard } from './components/ResultCard';
import { FiveRoundSummary } from './components/FiveRoundSummary';
import { BenchmarkModal } from './components/BenchmarkModal';
import { HistoryModal } from './components/HistoryModal';
import { GameMode, GamePhase, GameHistoryItem } from './types/game';
import { getReactionRank } from './utils/ranks';
import { sound } from './utils/audio';
import { Zap, Trophy, Flame, HelpCircle } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<GameMode>('standard');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);

  // 5-Round mode state
  const [fiveRounds, setFiveRounds] = useState<number[]>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);

  // Audio / Modals
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // History in LocalStorage
  const [history, setHistory] = useState<GameHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('reflexpulse_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const saveHistory = (newItem: GameHistoryItem) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 100);
      try {
        localStorage.setItem('reflexpulse_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('reflexpulse_history');
    } catch {
      // ignore
    }
  };

  // Best score calculation
  const bestScore = history.length > 0
    ? Math.min(...history.filter(h => h.timeMs > 50).map(h => h.timeMs))
    : null;

  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    setPhase('idle');
    setLastReactionTime(null);
    setFiveRounds([]);
    setCurrentRoundNumber(1);
  };

  const handlePhaseChange = useCallback((nextPhase: GamePhase, reactionTime?: number) => {
    if (nextPhase === 'result' && reactionTime !== undefined) {
      setLastReactionTime(reactionTime);

      if (mode === 'five_rounds') {
        const nextRounds = [...fiveRounds, reactionTime];
        setFiveRounds(nextRounds);

        if (nextRounds.length >= 5) {
          // 5 rounds finished!
          const avg = Math.round(nextRounds.reduce((a, b) => a + b, 0) / 5);
          saveHistory({
            id: crypto.randomUUID(),
            mode: 'five_rounds',
            timeMs: avg,
            timestamp: Date.now(),
            details: { rounds: nextRounds },
          });
          setPhase('series_complete');
          return;
        } else {
          setCurrentRoundNumber(nextRounds.length + 1);
          setPhase('result');
          return;
        }
      }

      // Record standard, audio, gonogo single trial
      if (reactionTime > 0) {
        saveHistory({
          id: crypto.randomUUID(),
          mode,
          timeMs: reactionTime,
          timestamp: Date.now(),
        });
      }
    }

    setPhase(nextPhase);
  }, [mode, fiveRounds]);

  const handleRetry = () => {
    if (mode === 'five_rounds') {
      setFiveRounds([]);
      setCurrentRoundNumber(1);
    }
    setLastReactionTime(null);
    setPhase('idle');
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Rank info for the current single result
  const currentRank = lastReactionTime !== null
    ? getReactionRank(lastReactionTime, mode === 'audio')
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentMode={mode}
        onSelectMode={handleSelectMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenBenchmarks={() => setIsBenchmarkOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        bestScore={bestScore}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        {/* If series completed in 5-round mode */}
        {phase === 'series_complete' ? (
          <FiveRoundSummary
            rounds={fiveRounds}
            onRetry={handleRetry}
          />
        ) : phase === 'result' && lastReactionTime !== null && currentRank ? (
          <div className="w-full flex flex-col items-center">
            {/* If in middle of 5-round trial */}
            {mode === 'five_rounds' && (
              <div className="mb-4 text-center">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                  ラウンド {fiveRounds.length} / 5 完了
                </span>
              </div>
            )}

            {/* Special display for Go/No-Go Successful Hold */}
            {lastReactionTime === 0 ? (
              <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                  <Zap className="w-8 h-8 fill-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">見事な自制心！</h3>
                <p className="text-sm text-slate-300 mb-6">
                  赤信号に釣られず、指を止めて待機することに成功しました！優れた衝動抑制能力です。
                </p>
                <button
                  onClick={handleRetry}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
                >
                  次の測定へ進む
                </button>
              </div>
            ) : (
              <ResultCard
                timeMs={lastReactionTime}
                rank={currentRank}
                onRetry={handleRetry}
                isAudio={mode === 'audio'}
              />
            )}
          </div>
        ) : (
          <GameCanvas
            mode={mode}
            phase={phase}
            currentRound={currentRoundNumber}
            totalRounds={5}
            lastReactionTime={lastReactionTime}
            onPhaseChange={handlePhaseChange}
            onReset={handleRetry}
          />
        )}

        {/* Mode Feature Hints below game */}
        {phase === 'idle' && (
          <div className="mt-8 grid sm:grid-cols-3 gap-3 w-full max-w-2xl text-xs">
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>超低遅延測定</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                高精度タイマーとPointerDown直結処理により、ハードウェア入力遅延を極限まで低減しています。
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>完全ランダム合図</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1.8秒〜5.0秒の間で毎回不規則に合図が出現。タイミング予測のフライングを厳格に判定します。
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>科学的ランク診断</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                人間の神経伝達速度統計に基づき、チーターからプロゲーマー、アスリート級まで正確に診断。
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-600">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReflexPulse · 精密反応速度測定 & 診断ゲーム</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              反応速度の基準表
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              自己記録一覧
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
