import type { Statistics, ShipState } from '../types/game';

export interface PlayerStats {
  statistics: Statistics;
  ship: ShipState;
}

const PIRATE_DEFEAT_WEIGHT = 0.4;
const TRADE_COMPLETE_WEIGHT = 0.2;
const EQUIPMENT_LEVEL_WEIGHT = 0.4;

const MAX_PIRATE_DEFEAT_REFERENCE = 100;
const MAX_TRADE_COMPLETE_REFERENCE = 100;
const MAX_EQUIPMENT_LEVEL = 10;

const BASE_DIFFICULTY_MULTIPLIER_MIN = 0.5;
const BASE_DIFFICULTY_MULTIPLIER_MAX = 2.0;

const BASE_RANDOM_VARIANCE_MIN = 0.9;
const BASE_RANDOM_VARIANCE_MAX = 1.1;

const normalizePiratesDefeated = (count: number): number => {
  return Math.min(1, Math.log10(count + 1) / Math.log10(MAX_PIRATE_DEFEAT_REFERENCE));
};

const normalizeTradesCompleted = (count: number): number => {
  return Math.min(1, Math.log10(count + 1) / Math.log10(MAX_TRADE_COMPLETE_REFERENCE));
};

const normalizeEquipmentLevel = (ship: ShipState): number => {
  const avgLevel = (ship.weaponLevel + ship.shieldLevel + ship.cargoLevel) / 3;
  return Math.min(1, avgLevel / MAX_EQUIPMENT_LEVEL);
};

export const calculatePlayerProficiency = (stats: PlayerStats): number => {
  const { statistics, ship } = stats;

  const pirateScore = normalizePiratesDefeated(statistics.piratesDefeated);
  const tradeScore = normalizeTradesCompleted(statistics.tradesCompleted);
  const equipmentScore = normalizeEquipmentLevel(ship);

  const proficiency =
    pirateScore * PIRATE_DEFEAT_WEIGHT +
    tradeScore * TRADE_COMPLETE_WEIGHT +
    equipmentScore * EQUIPMENT_LEVEL_WEIGHT;

  return Math.max(0, Math.min(1, proficiency));
};

const getDifficultyMultiplier = (proficiency: number): number => {
  return (
    BASE_DIFFICULTY_MULTIPLIER_MIN +
    proficiency * (BASE_DIFFICULTY_MULTIPLIER_MAX - BASE_DIFFICULTY_MULTIPLIER_MIN)
  );
};

const getBaseRandomVariance = (): number => {
  return BASE_RANDOM_VARIANCE_MIN + Math.random() * (BASE_RANDOM_VARIANCE_MAX - BASE_RANDOM_VARIANCE_MIN);
};

export const calculateDynamicDifficulty = (
  baseDifficulty: number,
  proficiency: number
): number => {
  const baseVariance = getBaseRandomVariance();
  const variedBase = baseDifficulty * baseVariance;
  const difficultyMultiplier = getDifficultyMultiplier(proficiency);
  return Math.max(1, Math.ceil(variedBase * difficultyMultiplier));
};
