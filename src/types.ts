/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RarityType = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';

export interface GameItem {
  id: string;
  name: string;
  category: string;
  rarity: RarityType;
  price: number;
  image: string; // Emoji representing the physical item
  color: string; // Border and theme color
  bgGradient: string; // Gradient class for backgrounds
  chanseWeight: number; // Probability weight
}

export interface Case {
  id: number;
  name: string;
  price: number;
  rarity: RarityType;
  image: string; // Emoji representing the case
  category: string; // Cheap, Mid, Elite, Epic, Legendary
  desc: string;
  itemPool: string[]; // List of core item IDs in this case
}

export interface InventoryItem {
  id: string; // Unique instance ID
  itemId: string;
  name: string;
  category: string;
  rarity: RarityType;
  price: number;
  image: string;
  color: string;
  bgGradient: string;
}

export interface GameUpgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  multiplier: number;
  level: number;
  type: 'click' | 'autoclick';
}

export interface GameStats {
  totalClicks: number;
  totalEarnedFromClicks: number;
  totalCasesOpened: number;
  totalSpentOnCases: number;
  totalSoldPrice: number;
  maxSingleDropPrice: number;
}
