import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, AlertTriangle, Play, Volume2, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { GameMode, GamePhase } from '../types/game';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  mode: GameMode;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  lastReactionTime: number | null;
  onPhaseChange: (nextPhase: GamePhase, reactionTime?: number) => void;
  onReset: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  phase,
  currentRound,
  totalRounds,
  lastReactionTime,
  onPhaseChange,
  onReset,
}) => {
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const noGoTimeoutRef = useRef<number | null>(null);
  const [isNoGoRound, setIsNoGoRound] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number } | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (noGoTimeoutRef.current) clearTimeout(noGoTimeoutRef.current);
    };
  }, []);

  // Launch the waiting countdown with random delay
  const startWaiting = useCallback(() => {
    onPhaseChange('waiting');
    sound.playStartWait();

    // Decide Go vs No-Go if in gonogo mode
    const isRed = mode === 'gonogo' ? Math.random() < 0.35 : false;
    setIsNoGoRound(isRed);

    // Random timing between 1800ms and 5000ms
    const randomDelay = Math.floor(Math.random() * 3200) + 1800;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (noGoTimeoutRef.current) clearTimeout(noGoTimeoutRef.current);

    timerRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      onPhaseChange('ready');

      if (mode === 'audio') {
        sound.playSignalTone(true);
      } else if (!isRed) {
        sound.playSignalTone(false);
      } else {
        // Red target alert
        sound.playStartWait();
      }

      // If it's a No-Go (red) target, and player correctly resists for 1200ms:
      if (isRed) {
        noGoTimeoutRef.current = window.setTimeout(() => {
          // Success! User didn't click
          sound.playSuccessReaction(200);
          onPhaseChange('result', 0); // 0 indicates successful hold
        }, 1200);
      }
    }, randomDelay);
  }, [mode, onPhaseChange]);

  // Handle direct pointer interaction (zero-latency)
  const handleTrigger = useCallback((e?: React.PointerEvent | KeyboardEvent) => {
    if (e && 'clientX' in e && e.clientX && e.clientY) {
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
      if (rect) {
        setClickRipple({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setTimeout(() => setClickRipple(null), 400);
      }
    }

    if (phase === 'idle') {
      startWaiting();
      return;
    }

    if (phase === 'waiting') {
      // FALSE START / EARLY CLICK!
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      sound.playEarlyBuzzer();
      onPhaseChange('early_click');
      return;
    }

    if (phase === 'ready') {
      const now = performance.now();
      const elapsed = Math.round(now - startTimeRef.current);

      if (noGoTimeoutRef.current) {
        clearTimeout(noGoTimeoutRef.current);
        noGoTimeoutRef.current = null;
      }

      // If user clicked during a RED No-Go
      if (mode === 'gonogo' && isNoGoRound) {
        sound.playMistakeBuzzer();
        onPhaseChange('gonogo_miss');
        return;
      }

      // Valid fast reaction
      sound.playSuccessReaction(elapsed);
      onPhaseChange('result', elapsed);
      return;
    }

    if (phase === 'early_click' || phase === 'gonogo_miss') {
      // Tap to retry immediately
      startWaiting();
      return;
    }

    if (phase === 'result') {
      // Tap to start next trial
      startWaiting();
    }
  }, [phase, startWaiting, onPhaseChange, mode, isNoGoRound]);

  // Keyboard shortcut: Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleTrigger(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTrigger]);

  // Dynamic appearance based on game phase
  let bgClasses = 'bg-slate-900/60 border-slate-800 hover:border-slate-700';
  let cursorClass = 'cursor-pointer';

  if (phase === 'waiting') {
    bgClasses = 'bg-red-950/40 border-red-500/30';
  } else if (phase === 'ready') {
    if (mode === 'gonogo' && isNoGoRound) {
      bgClasses = 'bg-rose-600 border-rose-400 text-white shadow-2xl shadow-rose-600/50';
    } else {
      bgClasses = 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-2xl shadow-emerald-500/50';
    }
  } else if (phase === 'early_click' || phase === 'gonogo_miss') {
    bgClasses = 'bg-rose-950/70 border-rose-500/50';
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Round tracker for five_rounds mode */}
      {mode === 'five_rounds' && (
        <div className="w-full flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">進行度:</span>
            <span className="text-sm font-bold font-mono-num text-emerald-400">
              ラウンド {currentRound} / {totalRounds}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i + 1 < currentRound
                    ? 'bg-emerald-400'
                    : i + 1 === currentRound
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/40 scale-125'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Touch/Click Arena */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          handleTrigger(e);
        }}
        className={`relative w-full h-[380px] sm:h-[440px] rounded-3xl border-2 transition-colors duration-100 flex flex-col items-center justify-center p-6 sm:p-10 text-center overflow-hidden touch-manipulation ${bgClasses} ${cursorClass}`}
      >
        {/* Ripple effect */}
        {clickRipple && (
          <span
            className="absolute rounded-full bg-white/25 pointer-events-none animate-ping"
            style={{
              left: clickRipple.x - 40,
              top: clickRipple.y - 40,
              width: 80,
              height: 80,
            }}
          />
        )}

        {/* PHASE: IDLE */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-5 max-w-md pointer-events-none">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse-ring">
              <Play className="w-10 h-10 fill-emerald-400 ml-1" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                タップしてスタート
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {mode === 'standard' && '画面が【赤】から【緑】に変わった瞬間に、画面またはスペースキーを押してください！'}
                {mode === 'five_rounds' && '5回連続で測定し、平均速度と安定度を判定します。合図に合わせて素早く押しましょう！'}
                {mode === 'audio' && '画面は見ずに音に集中！「ピピッ！」と音が鳴った瞬間に素早く押してください。'}
                {mode === 'gonogo' && '【緑色】が出たら素早くタップ！【赤色】が出たら押さずに我慢（待機）してください。'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-num">Space</span>
              <span>または画面タップで測定</span>
            </div>
          </div>
        )}

        {/* PHASE: WAITING */}
        {phase === 'waiting' && (
          <div className="flex flex-col items-center gap-5 pointer-events-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold text-xs">
                WAIT
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                合図を待ってください...
              </h2>
              <p className="text-xs sm:text-sm text-red-300/80 mt-2 font-medium">
                ※ 合図が出る前にタップするとフライングになります
              </p>
            </div>
          </div>
        )}

        {/* PHASE: READY (THE SIGNAL) */}
        {phase === 'ready' && (
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            {mode === 'gonogo' && isNoGoRound ? (
              <>
                <ShieldAlert className="w-20 h-20 text-white animate-bounce stroke-[2.5]" />
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
                  押すな！ (WAIT)
                </h2>
                <p className="text-sm font-bold text-white/90">
                  赤が出た時はそのまま我慢してください！
                </p>
              </>
            ) : (
              <>
                <Zap className="w-24 h-24 text-slate-950 fill-slate-950 animate-bounce" />
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 uppercase">
                  今すぐタップ！
                </h2>
                <p className="text-sm sm:text-base font-bold text-slate-900/80">
                  CLICK / TAP NOW!
                </p>
              </>
            )}
          </div>
        )}

        {/* PHASE: EARLY CLICK (FALSE START) */}
        {phase === 'early_click' && (
          <div className="flex flex-col items-center gap-5 pointer-events-none max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                早すぎます！フライング
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                合図が出る前に画面を押してしまいました。焦らずに合図を待ってから押しましょう。
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/60 px-4 py-2 rounded-xl border border-rose-800">
              <RotateCcw className="w-4 h-4" />
              <span>タップしてもう一度待機</span>
            </div>
          </div>
        )}

        {/* PHASE: GONOGO MISS */}
        {phase === 'gonogo_miss' && (
          <div className="flex flex-col items-center gap-5 pointer-events-none max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                ミス！赤で押してしまいました
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Go/No-Goテストでは、赤色が出た時は押さずに耐える必要があります。
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/60 px-4 py-2 rounded-xl border border-rose-800">
              <RotateCcw className="w-4 h-4" />
              <span>タップしてリトライ</span>
            </div>
          </div>
        )}
      </div>

      {/* Control bar below arena */}
      <div className="w-full flex items-center justify-between mt-4 px-2 text-xs text-slate-500">
        <div>
          <span>ショートカット: </span>
          <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono-num text-[11px]">
            Space
          </kbd>
          <span className="ml-1">キーで即時反応</span>
        </div>

        {phase !== 'idle' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-slate-400 hover:text-white transition-colors underline hover:no-underline"
          >
            やり直す
          </button>
        )}
      </div>
    </div>
  );
};
