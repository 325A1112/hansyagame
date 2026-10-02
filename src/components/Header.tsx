import React from 'react';
import { Volume2, VolumeX, BarChart2, BookOpen, Zap } from 'lucide-react';
import { GameMode } from '../types/game';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenBenchmarks: () => void;
  onOpenHistory: () => void;
  bestScore: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  isMuted,
  onToggleMute,
  onOpenBenchmarks,
  onOpenHistory,
  bestScore,
}) => {
  const modes: { id: GameMode; label: string; tag: string }[] = [
    { id: 'standard', label: '通常モード', tag: '視覚' },
    { id: 'five_rounds', label: '5回トライアル', tag: '連続' },
    { id: 'audio', label: '聴覚反射', tag: '音合図' },
    { id: 'gonogo', label: 'Go/No-Go', tag: '認知' },
  ];

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              ReflexPulse
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              反応速度測定
            </span>
          </div>
        </div>

        {/* Zone 2: Mode Selector */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-x-auto max-w-md">
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{m.label}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isActive ? 'bg-emerald-600/30 text-slate-950' : 'text-slate-500'}`}>
                  {m.tag}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Quick Stats */}
        <div className="flex items-center gap-2 shrink-0">
          {bestScore !== null && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-400">自己ベスト:</span>
              <span className="font-mono-num font-bold text-emerald-400">{bestScore} ms</span>
            </div>
          )}

          <button
            onClick={onOpenBenchmarks}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors"
            title="反応速度の基準表 & 解説"
            aria-label="反応速度の基準表"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistory}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors"
            title="測定履歴 & 統計"
            aria-label="測定履歴"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'text-slate-500 border-slate-800 hover:text-slate-300'
                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
            }`}
            title={isMuted ? 'サウンドをONにする' : 'サウンドをOFFにする'}
            aria-label="サウンド切り替え"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
