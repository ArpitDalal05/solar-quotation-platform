const STATE_GENERATION_FACTORS: Record<string, number> = {
  // Simplified sample factors (kWh/kWp/day) for Indian states
  // These can be tuned per real data later.
  MAHARASHTRA: 4.5,
  GUJARAT: 4.8,
  RAJASTHAN: 5.0,
  KARNATAKA: 4.6,
  TAMIL_NADU: 4.7,
  DELHI: 4.4,
  TELANGANA: 4.6,
  "UTTAR PRADESH": 4.3,
};

const DEFAULT_FACTOR = 4.5;

export function getGenerationFactorByState(state: string): number {
  const key = state.trim().toUpperCase();
  return STATE_GENERATION_FACTORS[key] ?? DEFAULT_FACTOR;
}

