import { FishType, UpgradeTier } from './types';

export const FISH_TYPES: FishType[] = [
  { id: 'guppy', name: '霓虹孔雀魚', emoji: '🐟', baseValue: 10, speed: 0.5, depth: 0.1, rarity: 'Common', color: '#4ade80' },
  { id: 'shrimp', name: '美味鮮蝦', emoji: '🦐', baseValue: 15, speed: 0.3, depth: 0.25, rarity: 'Common', color: '#f87171' },
  { id: 'clownfish', name: '迷糊小丑魚', emoji: '🐠', baseValue: 25, speed: 0.7, depth: 0.35, rarity: 'Common', color: '#facc15' },
  { id: 'crab', name: '頑皮螃蟹', emoji: '🦀', baseValue: 40, speed: 0.4, depth: 0.95, rarity: 'Common', color: '#ef4444' },
  { id: 'puffer', name: '刺刺河豚', emoji: '🐡', baseValue: 50, speed: 0.3, depth: 0.5, rarity: 'Rare', color: '#fb923c' },
  { id: 'turtle', name: '長壽海龜', emoji: '🐢', baseValue: 100, speed: 0.25, depth: 0.55, rarity: 'Rare', color: '#22c55e' },
  { id: 'squid', name: '墨水大師', emoji: '🦑', baseValue: 80, speed: 0.9, depth: 0.7, rarity: 'Rare', color: '#f472b6' },
  { id: 'octopus', name: '智者章魚', emoji: '🐙', baseValue: 130, speed: 0.6, depth: 0.8, rarity: 'Rare', color: '#a855f7' },
  { id: 'anglerfish', name: '深淵燈籠魚', emoji: '🏮', baseValue: 1100, speed: 0.8, depth: 0.93, rarity: 'Legendary', color: '#ea580c' },
  { id: 'shark', name: '大白鯊', emoji: '🦈', baseValue: 200, speed: 1.2, depth: 0.9, rarity: 'Legendary', color: '#94a3b8' },
  { id: 'whale', name: '莫比小鯨', emoji: '🐋', baseValue: 500, speed: 0.2, depth: 0.85, rarity: 'Legendary', color: '#60a5fa' },
  { id: 'dragon', name: '深海蒼龍', emoji: '🐉', baseValue: 1000, speed: 1.5, depth: 0.98, rarity: 'Legendary', color: '#fbbf24' },
  { id: 'nessie', name: '尼斯湖水怪', emoji: '🦕', baseValue: 850, speed: 0.5, depth: 0.92, rarity: 'Legendary', color: '#10b981' },
  { id: 'mermaid', name: '人魚公主', emoji: '🧜‍♀️', baseValue: 2000, speed: 1.8, depth: 0.75, rarity: 'Legendary', color: '#ec4899' },
  { id: 'mosasaur', name: '遠古滄龍', emoji: '🐊', baseValue: 2200, speed: 1.4, depth: 0.88, rarity: 'Legendary', color: '#15803d' },
  { id: 'king_lobster', name: '帝王龍蝦', emoji: '🦞', baseValue: 1800, speed: 0.5, depth: 0.94, rarity: 'Legendary', color: '#991b1b' },
  { id: 'leviathan', name: '利維坦', emoji: '🐍', baseValue: 3000, speed: 1.6, depth: 0.97, rarity: 'Legendary', color: '#312e81' },
];

export const GAME_CONFIG = {
  GRAVITY: 0.8,
  REEL_POWER: 2.0, 
  TENSION_INCREASE: 0.5, // Slowed down for longer hold times
  TENSION_DECREASE: 0.3, // Slow recovery to maintain tension pressure
  HOOK_RADIUS: 5, // %
  WATER_SURFACE_Y: 15, 
};

export const ROD_UPGRADES: UpgradeTier[] = [
  { level: 0, name: '竹製釣竿', cost: 0, effectValue: 0, description: '最基本的釣竿。' },
  { level: 1, name: '碳纖維釣竿', cost: 200, effectValue: 20, description: '增加發現稀有魚類的機率。' },
  { level: 2, name: '專業鈦合金竿', cost: 600, effectValue: 50, description: '大幅增加發現稀有與傳說魚類的機率。' },
  { level: 3, name: '海神三叉戟', cost: 1500, effectValue: 100, description: '傳說魚類會被它吸引。' },
];

export const REEL_UPGRADES: UpgradeTier[] = [
  { level: 0, name: '手動捲線器', cost: 0, effectValue: 1.0, description: '雖然慢，但還能用。' },
  { level: 1, name: '高速捲線器', cost: 150, effectValue: 1.3, description: '收線速度提升 30%。' },
  { level: 2, name: '強力電動捲線器', cost: 500, effectValue: 1.7, description: '收線速度提升 70%。' },
  { level: 3, name: '工業級絞盤', cost: 1200, effectValue: 2.3, description: '收線速度提升 130%，連鯨魚都拉得動！' },
];