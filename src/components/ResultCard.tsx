import React from 'react';
import { RotateCcw, Share2, Check, ArrowRight, Zap, Target } from 'lucide-react';
import { RankInfo } from '../types/game';

interface ResultCardProps {
  timeMs: number;
  rank: RankInfo;
  onRetry: () => void;
  isAudio?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  timeMs,
  rank,
  onRetry,
  isAudio = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const humanAvg = isAudio ? 160 : 250;
  const diffFromAvg = humanAvg - timeMs;
  const isFasterThanAvg = diffFromAvg > 0;

  const handleShare = async () => {
    const text = `【ReflexPulse 反応速度測定】\n記録: ${timeMs} ms\n称号: ${rank.tier}ランク [${rank.title}]\n動物タイプ: ${rank.animal} ${rank.animalIcon} (${rank.percentile})\n#反応速度テスト #ReflexPulse`;
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-scaleUp">
      {/* Top Badge & Archetype */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label={rank.animal}>
            {rank.animalIcon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-extrabold ${rank.color}`}>
                {rank.tier} ランク
              </span>
              <span className="text-slate-400 font-medium text-sm">
                · {rank.percentile}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {rank.title} ({rank.animal}級)
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">平均との差</div>
          <div className={`text-sm font-bold font-mono-num ${isFasterThanAvg ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isFasterThanAvg ? `+${diffFromAvg} ms 高速` : `${Math.abs(diffFromAvg)} ms 遅延`}
          </div>
        </div>
      </div>

      {/* Hero Reaction Time Number */}
      <div className="text-center py-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          測定反応時間
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-6xl sm:text-7xl font-black font-mono-num tracking-tight text-white">
            {timeMs}
          </span>
          <span className="text-2xl font-bold text-emerald-400">ms</span>
        </div>
        <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
          {rank.description}
        </p>
      </div>

      {/* Spectrum Position Bar */}
      <div className="my-6 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
        <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
          <span className="text-amber-400">神速 (140ms)</span>
          <span className="text-slate-300">一般平均 ({humanAvg}ms)</span>
          <span className="text-rose-400">のんびり (400ms)</span>
        </div>
        
        {/* Spectrum line with user marker */}
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-emerald-400 via-cyan-400 to-rose-500 rounded-full opacity-70" />
          
          {/* User pin marker */}
          {(() => {
            const min = 120;
            const max = 450;
            const clamped = Math.max(min, Math.min(max, timeMs));
            const pct = ((clamped - min) / (max - min)) * 100;
            return (
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                style={{ left: `${pct}%` }}
              >
                <div className="w-4 h-4 bg-white border-2 border-slate-950 rounded-full shadow-lg ring-2 ring-emerald-400" />
                <span className="text-[10px] font-bold font-mono-num bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                  あなた: {timeMs}ms
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
          <span>もう一度挑戦する</span>
          <span className="text-xs opacity-75 font-normal ml-1">(Space / タップ)</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          title="スコアをクリップボードにコピー"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'コピーしました！' : '結果をシェア'}</span>
        </button>
      </div>
    </div>
  );
};
