export type GameMode = 'standard' | 'five_rounds' | 'audio' | 'gonogo';

export type GamePhase = 
  | 'idle'           // Ready to start
  | 'waiting'        // Waiting for random signal (1.8s - 5.0s)
  | 'ready'          // Signal is active! Measure reaction time
  | 'early_click'    // Clicked too early (false start)
  | 'result'         // Round result shown
  | 'series_complete' // 5-round streak summary
  | 'gonogo_miss';   // Pressed on RED during Go/No-Go

export interface RoundRecord {
  id: string;
  roundNumber: number;
  timeMs: number;
  isEarly: boolean;
}

export interface GameHistoryItem {
  id: string;
  mode: GameMode;
  timeMs: number;
  timestamp: number;
  details?: {
    rounds?: number[];
    isAudio?: boolean;
    accuracy?: number;
  };
}

export interface RankInfo {
  tier: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  animal: string;
  animalIcon: string;
  color: string;
  description: string;
  percentile: string;
}
