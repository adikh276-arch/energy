export interface EnergyLog {
  id: string;
  timestamp: string;
  level: 1 | 2 | 3 | 4 | 5;
  energyType: 'Physical' | 'Cognitive' | 'Both';
  factors: string[];
  tobaccoUrge: 'None' | 'Mild' | 'Strong';
  physicalActivity: 'None' | 'Light' | 'Moderate' | 'Vigorous';
  meals: number;
  waterMl: number;
  notes: string;
}

export interface EnergyAction {
  type: string;
  timestamp: string;
}

export const ENERGY_LEVELS = [
  { level: 1 as const, emoji: '🪫', label: 'Severely depleted' },
  { level: 2 as const, emoji: '😩', label: 'Low' },
  { level: 3 as const, emoji: '😐', label: 'Moderate' },
  { level: 4 as const, emoji: '⚡', label: 'Good' },
  { level: 5 as const, emoji: '🚀', label: 'High' },
];

export const FACTORS = [
  'Poor sleep', 'Withdrawal', 'Missed meal', 'Dehydration', 'Work stress',
  'Physical activity', 'Good sleep', 'Post-meal fatigue', 'Emotional strain', 'Other',
];

export const WATER_STEPS = [0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000];

export const WATER_LABELS: Record<number, string> = {
  0: '0', 250: '250ml', 500: '500ml', 750: '750ml',
  1000: '1L', 1500: '1.5L', 2000: '2L', 2500: '2.5L', 3000: '3L+',
};

export const LEVEL_COLORS: Record<number, string> = {
  1: '#DC3545',
  2: '#D97706',
  3: '#7A8FA6',
  4: '#35AEF7',
  5: '#0EA66E',
};
