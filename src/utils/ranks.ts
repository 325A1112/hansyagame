import { RankInfo } from '../types/game';

export function getReactionRank(ms: number, isAudio = false): RankInfo {
  // Humans process auditory stimuli ~40-60ms faster than visual stimuli
  // because auditory signals take ~8-10ms to reach the brain, while visual signals take 20-40ms.
  const adjustedMs = isAudio ? ms + 45 : ms;

  if (adjustedMs < 160) {
    return {
      tier: 'SSS',
      title: '神速・サイボーグ級',
      animal: 'チーター',
      animalIcon: '🐆',
      color: 'text-amber-400',
      description: '常識を超越した神がかり的な反射速度です。トッププロゲーマーやF1ドライバーでも上位1%未満の驚異的な反応です。',
      percentile: '上位 0.1% 未満',
    };
  }

  if (adjustedMs < 195) {
    return {
      tier: 'SS',
      title: 'プロeスポーツ・F1級',
      animal: 'ハヤブサ',
      animalIcon: '🦅',
      color: 'text-emerald-400',
      description: '瞬時に世界を捉える超一流の動体視力と神経伝達速度です。FPSゲームやモータースポーツの第一線で戦える最高峰の反射神経です。',
      percentile: '上位 2%',
    };
  }

  if (adjustedMs < 230) {
    return {
      tier: 'S',
      title: 'トップアスリート級',
      animal: 'ヒョウ',
      animalIcon: '🐅',
      color: 'text-cyan-400',
      description: '非常に鋭い反射神経です。格闘技やテニス、卓球などのプロ競技で相手の動きに即座に対応できる優れた俊敏性を誇ります。',
      percentile: '上位 10%',
    };
  }

  if (adjustedMs < 270) {
    return {
      tier: 'A',
      title: '優良・ハイスピード',
      animal: 'サラブレッド',
      animalIcon: '🐎',
      color: 'text-blue-400',
      description: '一般的な人間の平均（約250ms）と同等かそれ以上に素早い反応です。集中力が高く日常の咄嗟の判断も極めて正確です。',
      percentile: '上位 40%',
    };
  }

  if (adjustedMs < 320) {
    return {
      tier: 'B',
      title: '平均的・リラックス',
      animal: 'ネコ',
      animalIcon: '🐈',
      color: 'text-slate-300',
      description: '自然体で安定した平均的な反射神経です。普段の生活や運転には全く支障のない健全なスピードです。',
      percentile: '上位 65%',
    };
  }

  if (adjustedMs < 390) {
    return {
      tier: 'C',
      title: 'ややのんびり・慎重派',
      animal: 'ウサギ',
      animalIcon: '🐇',
      color: 'text-orange-400',
      description: '少し落ち着いた反応速度です。画面を見つめる姿勢や指の準備、ディスプレイのリフレッシュレートなどの影響もあります。',
      percentile: '上位 85%',
    };
  }

  return {
    tier: 'D',
    title: 'お疲れ気味・要休息',
    animal: 'カメ',
    animalIcon: '🐢',
    color: 'text-rose-400',
    description: '睡眠不足や目の疲労、集中力の低下があるかもしれません。少し目を休めてから再挑戦してみましょう！',
    percentile: '上位 95% 以下',
  };
}

export const HUMAN_BENCHMARKS = [
  { label: 'チーター・神速', time: 140, desc: '極限の超人的反射' },
  { label: 'プロゲーマー / F1ドライバー', time: 180, desc: '訓練された最高峰の速度' },
  { label: '人間の聴覚平均反射', time: 160, desc: '音は視覚より速く脳に到達' },
  { label: '人間の視覚平均反射', time: 250, desc: '一般的な健康な成人の基準' },
  { label: '疲労時・眠気がある時', time: 350, desc: '睡眠不足や長時間の作業後' },
  { label: '酒気帯び・泥酔時', time: 500, desc: '判断と伝達が大幅に遅延' },
];
