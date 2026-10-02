import React from 'react';
import { X, Trash2, Award, Clock, RotateCcw } from 'lucide-react';
import { GameHistoryItem, GameMode } from '../types/game';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'standard':
        return '通常 (視覚)';
      case 'five_rounds':
        return '5回トライアル';
      case 'audio':
        return '聴覚反射';
      case 'gonogo':
        return 'Go/No-Go';
      default:
        return mode;
    }
  };

  const bestScore = history.length > 0 
    ? Math.min(...history.map(h => h.timeMs))
    : null;

  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, cur) => acc + cur.timeMs, 0) / history.length)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">測定履歴と自己記録</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/30 border-b border-slate-800/80">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-1">歴代最速タイム</div>
            <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
              {bestScore !== null ? `${bestScore} ms` : '---'}
            </div>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-1">全テスト平均</div>
            <div className="text-2xl font-extrabold font-mono-num text-cyan-400">
              {averageScore !== null ? `${averageScore} ms` : '---'}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>まだ測定記録がありません。</p>
              <p className="text-xs mt-1">ゲームをプレイするとここに記録が保存されます。</p>
            </div>
          ) : (
            history.slice(0, 50).map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const isBest = item.timeMs === bestScore;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isBest 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="text-xs text-slate-500">{dateStr}</span>
                    {isBest && (
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> BEST
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-mono-num text-white">
                      {item.timeMs}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">ms</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('これまでの測定履歴をすべて削除しますか？')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>履歴を消去</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
