import { PLANETS, getPlanet, getDistance } from '../data/planets';
import {
  calculatePlayerProficiency,
  calculateDynamicDifficulty,
  type PlayerStats,
} from './difficultyEngine';

export type TravelEventType = 'none' | 'pirates' | 'event';

export interface TravelResult {
  eventType: TravelEventType;
  pirateDifficulty?: number;
}

export type { PlayerStats };
export { calculatePlayerProficiency, calculateDynamicDifficulty };

export const calculateTravelDuration = (fromId: string, toId: string): number => {
  const from = getPlanet(fromId);
  const to = getPlanet(toId);
  if (!from || !to) return 3000;
  const dist = getDistance(from, to);
  return 2500 + dist * 6000;
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
