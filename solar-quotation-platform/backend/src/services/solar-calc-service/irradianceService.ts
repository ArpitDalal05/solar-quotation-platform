/**
 * Solar Irradiance Approximation
 * Estimates Irradiance_kWh_m2_day using location latitude and cloud cover.
 * Fallback: India average = 5.0 kWh/m²/day when exact data is unavailable.
 */

const INDIA_AVERAGE_IRRADIANCE = 5.0; // kWh/m²/day

/**
 * Approximates daily solar irradiance (kWh/m²/day) from coordinates and cloud cover.
 * - Uses latitude: higher latitude = slightly lower irradiance (simplified).
 * - Reduces by cloud cover: more clouds = less irradiance.
 *
 * @param lat - Latitude (e.g. 18.52 for Pune)
 * @param cloudCover - Cloud cover percentage (0–100)
 * @returns Irradiance in kWh/m²/day, rounded to 2 decimals
 */
export function estimateIrradiance(
  lat: number,
  cloudCover: number
): number {
  // Base irradiance: India average 5.0; adjust for latitude (rough: 4.0–5.5 for India)
  const latFactor = 1 - Math.abs(lat) / 90 * 0.15; // ~0.97 for Pune
  let base = INDIA_AVERAGE_IRRADIANCE * latFactor;

  // Cloud cover reduces irradiance (up to ~40% reduction at 100% clouds)
  const cloudFactor = 1 - (cloudCover / 100) * 0.4;
  const irradiance = base * cloudFactor;

  return Math.round(Math.max(1.5, irradiance) * 100) / 100;
}

/**
 * Returns India average irradiance when no weather data is available.
 */
export function getDefaultIrradiance(): number {
  return INDIA_AVERAGE_IRRADIANCE;
}
