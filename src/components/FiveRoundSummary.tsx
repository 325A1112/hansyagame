import React from 'react';
import { RotateCcw, Share2, Check, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { getReactionRank } from '../utils/ranks';

interface FiveRoundSummaryProps {
  rounds: number[];
  onRetry: () => void;
}

export const FiveRoundSummary: React.FC<FiveRoundSummaryProps> = ({ rounds, onRetry }) => {
  const [copied, setCopied] = React.useState(false);

  if (rounds.length === 0) return null;

  const fastest = Math.min(...rounds);
  const average = Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length);
  const slowest = Math.max(...rounds);

  // Standard deviation for consistency
  const variance = rounds.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / rounds.length;
  const stdDev = Math.round(Math.sqrt(variance));

  let consistencyLabel = '極めて安定';
  let consistencyColor = 'text-emerald-400';
  if (stdDev > 40) {
    consistencyLabel = 'ややムラあり';
    consistencyColor = 'text-orange-400';
  } else if (stdDev > 20) {
    consistencyLabel = '安定感良好';
    consistencyColor = 'text-cyan-400';
  }

  const rank = getReactionRank(average);

  const handleShare = async () => {
    const text = `【ReflexPulse 5連続測定チャレンジ】\n平均: ${average} ms | 最速: ${fastest} ms\n安定度: ±${stdDev}ms (${consistencyLabel})\n総合称号: ${rank.tier}ランク [${rank.title} / ${rank.animal}]\n#反応速度テスト #ReflexPulse`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-scaleUp">
      {/* Header */}
      <div className="text-center pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" /> 5回トライアル完走
        </div>
        <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          <span>{rank.animalIcon}</span>
          <span className={rank.color}>{rank.tier} ランク</span>
          <span className="text-slate-400 text-xl font-normal">/ {rank.title}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          5回の連続測定を完了しました。平均速度と安定性から算出された総合評価です。
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-3 my-6">
        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 mb-1">5回平均タイム</div>
          <div className="text-2xl font-black font-mono-num text-white">
            {average} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 mb-1">最速ラウンド</div>
          <div className="text-2xl font-black font-mono-num text-emerald-400">
            {fastest} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 mb-1">反射安定度</div>
          <div className={`text-base font-bold font-mono-num ${consistencyColor} mt-1`}>
            ±{stdDev} ms
          </div>
          <div className="text-[10px] text-slate-400">{consistencyLabel}</div>
        </div>
      </div>

      {/* Breakdown per round */}
      <div className="space-y-2 mb-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          各ラウンドの内訳
        </div>
        <div className="grid grid-cols-5 gap-2">
          {rounds.map((time, idx) => {
            const isFastest = time === fastest;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isFastest
                    ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800/80'
                }`}
              >
                <div className="text-[10px] text-slate-500 font-medium mb-1">
                  R{idx + 1}
                </div>
                <div className={`text-sm font-bold font-mono-num ${isFastest ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {time}
                </div>
                <div className="text-[9px] text-slate-500">ms</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
          <span>もう一度5回挑戦する</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'コピー完了' : 'スコアを共有'}</span>
        </button>
      </div>
    </div>
  );
};
