import React from 'react';
import { X, Award, Eye, Ear, Brain, Activity } from 'lucide-react';
import { HUMAN_BENCHMARKS } from '../utils/ranks';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">反応速度の基準 & 科学的データ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Key benchmark bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              一般的な反応速度の目安 (ミリ秒)
            </h3>
            <div className="space-y-2.5">
              {HUMAN_BENCHMARKS.map((item, index) => {
                const maxTime = 550;
                const percent = Math.min(100, Math.round((item.time / maxTime) * 100));
                return (
                  <div key={index} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <span className="font-mono-num font-bold text-emerald-400 text-base">
                        {item.time} ms
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scientific insights */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Eye className="w-4 h-4" />
                <span>視覚反応 (約 200〜250ms)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                網膜から視神経を経て大脳の視覚野、運動野、指の筋肉へと信号が伝わるため、多くの神経経路を経由します。
              </p>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Ear className="w-4 h-4" />
                <span>聴覚反応 (約 140〜170ms)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                音の刺激は脳幹を通るより直接的な短絡経路をたどるため、視覚刺激よりも約40〜60ミリ秒速く身体が反応します。
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Brain className="w-4 h-4" />
              <span>測定精度と環境による影響</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ブラウザやディスプレイのリフレッシュレート（60Hz画面では1フレーム約16.6msの描画遅延）、マウスやタッチパネルの入力遅延（約5〜20ms）が加わります。本アプリでは入力遅延を極力ゼロにするハードウェアタッチイベント処理と高精度タイマーを使用しています。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
