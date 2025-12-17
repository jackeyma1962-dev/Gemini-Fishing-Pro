export enum GameState {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  SINKING = 'SINKING',
  HOOKED = 'HOOKED',
  REELING = 'REELING',
  CAUGHT = 'CAUGHT',
  LOST = 'LOST',
}

export interface FishType {
  id: string;
  name: string;
  emoji: string;
  baseValue: number;
  speed: number;
  depth: number; // 0 (surface) to 1 (bottom)
  rarity: 'Common' | 'Rare' | 'Legendary';
  color: string;
}

export interface ActiveFish {
  id: number;
  typeId: string;
  x: number; // 0 to 100 (%)
  y: number; // 0 to 100 (%) relative to water height
  direction: 1 | -1;
  speedMultiplier: number;
}

export interface CatchResult {
  fish: FishType;
  weight: number;
  lore: string;
  geminiAnalysis?: string;
}

export interface HookPosition {
  x: number;
  y: number;
}

export interface UpgradeTier {
  level: number;
  name: string;
  cost: number;
  effectValue: number; // Multiplier or weight addition
  description: string;
}

export interface UpgradeState {
  rodLevel: number;
  reelLevel: number;
}