import { PLANETS, getPlanet, getDistance } from '../data/planets';
import type { Statistics, ShipState } from '../types/game';

export type TravelEventType = 'none' | 'pirates' | 'event';

export interface TravelResult {
  eventType: TravelEventType;
  pirateDifficulty?: number;
}

export interface PlayerStats {
  statistics: Statistics;
  ship: ShipState;
}

export const calculateTravelDuration = (fromId: string, toId: string): number => {
  const from = getPlanet(fromId);
  const to = getPlanet(toId);
  if (!from || !to) return 3000;
  const dist = getDistance(from, to);
  return 2500 + dist * 6000;
};

const normalizePiratesDefeated = (count: number): number => {
  return Math.min(1, Math.log10(count + 1) / Math.log10(100));
};

const normalizeTradesCompleted = (count: number): number => {
  return Math.min(1, Math.log10(count + 1) / Math.log10(100));
};

const normalizeEquipmentLevel = (ship: ShipState): number => {
  const avgLevel = (ship.weaponLevel + ship.shieldLevel + ship.cargoLevel) / 3;
  return Math.min(1, avgLevel / 10);
};

export const calculatePlayerProficiency = (stats: PlayerStats): number => {
  const { statistics, ship } = stats;

  const pirateScore = normalizePiratesDefeated(statistics.piratesDefeated);
  const tradeScore = normalizeTradesCompleted(statistics.tradesCompleted);
  const equipmentScore = normalizeEquipmentLevel(ship);

  const proficiency = pirateScore * 0.4 + tradeScore * 0.2 + equipmentScore * 0.4;

  return Math.max(0, Math.min(1, proficiency));
};

export const calculateDynamicDifficulty = (baseDifficulty: number, proficiency: number): number => {
  const difficultyMultiplier = 0.5 + proficiency * 1.5;
  const randomVariance = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.ceil(baseDifficulty * difficultyMultiplier * randomVariance));
};

export const rollTravelEvent = (fromId: string, toId: string, playerStats?: PlayerStats): TravelResult => {
  const from = getPlanet(fromId);
  const to = getPlanet(toId);
  if (!from || !to) return { eventType: 'none' };

  const dist = getDistance(from, to);
  const pirateChance = 0.1 + dist * 0.45;
  const eventChance = 0.12;

  const roll = Math.random();
  const cumulativePirate = pirateChance;
  const cumulativeEvent = pirateChance + eventChance;

  if (roll < cumulativePirate) {
    let difficulty = Math.ceil(1 + dist * 4);
    if (playerStats) {
      const proficiency = calculatePlayerProficiency(playerStats);
      difficulty = calculateDynamicDifficulty(difficulty, proficiency);
    }
    return { eventType: 'pirates', pirateDifficulty: difficulty };
  } else if (roll < cumulativeEvent) {
    return { eventType: 'event' };
  }

  return { eventType: 'none' };
};

export const getReachablePlanets = (currentId: string): string[] => {
  return PLANETS.filter((p) => p.id !== currentId).map((p) => p.id);
};
