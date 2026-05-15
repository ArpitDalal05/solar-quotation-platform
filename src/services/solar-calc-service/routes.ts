/**
 * Solar Calculator API
 * POST /solar-calc – accepts city or coordinates, returns full solar calculation.
 */

import { Router } from "express";
import { z } from "zod";
import { fetchWeatherData } from "./weatherService";
import { estimateIrradiance, getDefaultIrradiance } from "./irradianceService";
import { runSolarCalculation } from "./calculationEngine";

export const solarCalcRouter = Router();

const solarCalcSchema = z.object({
  city: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  monthlyConsumption: z.number().positive(),
  electricityRate: z.number().positive().default(8),
  panelWattage: z.number().positive().default(400),
  efficiency: z.number().min(0).max(1).default(0.75),
  costPerWatt: z.number().positive().default(80),
  installationMultiplier: z.number().min(0).max(1).default(0.1),
  gstRate: z.number().min(0).max(1).default(0.18),
});

/**
 * POST /solar-calc
 *
 * Input:
 * {
 *   "city": "Pune",
 *   "monthlyConsumption": 300
 * }
 *
 * Or with coordinates:
 * {
 *   "lat": 18.52,
 *   "lon": 73.86,
 *   "monthlyConsumption": 300
 * }
 *
 * Optional overrides: electricityRate, panelWattage, efficiency, costPerWatt,
 * installationMultiplier, gstRate
 */
solarCalcRouter.post("/", async (req, res, next) => {
  try {
    const data = solarCalcSchema.parse(req.body);

    if (!data.city && (data.lat == null || data.lon == null)) {
      return res.status(400).json({
        message: "Provide either city or lat/lon coordinates",
      });
    }

    let irradiance: number;
    let locationLabel: string;

    try {
      const weather = await fetchWeatherData({
        city: data.city,
        lat: data.lat,
        lon: data.lon,
      });

      irradiance = estimateIrradiance(
        weather.coordinates.lat,
        weather.cloudCover
      );
      locationLabel = weather.city
        ? `${weather.city}, ${weather.country}`
        : `${weather.coordinates.lat}, ${weather.coordinates.lon}`;

      // Run calculation with weather-derived irradiance
      const result = runSolarCalculation(
        {
          monthlyConsumption: data.monthlyConsumption,
          electricityRate: data.electricityRate,
          panelWattage: data.panelWattage,
          efficiency: data.efficiency,
          costPerWatt: data.costPerWatt,
          installationMultiplier: data.installationMultiplier,
          gstRate: data.gstRate,
          irradiance_kWh_m2_day: irradiance,
        },
        locationLabel
      );

      return res.json({
        ...result,
        weather: {
          temperature: weather.temperature,
          cloudCover: weather.cloudCover,
          sunrise: weather.sunrise,
          sunset: weather.sunset,
          coordinates: weather.coordinates,
        },
      });
    } catch (weatherErr) {
      // Fallback: use India average irradiance when weather API fails
      irradiance = getDefaultIrradiance();
      locationLabel = data.city || "India (default)";

      const result = runSolarCalculation(
        {
          monthlyConsumption: data.monthlyConsumption,
          electricityRate: data.electricityRate,
          panelWattage: data.panelWattage,
          efficiency: data.efficiency,
          costPerWatt: data.costPerWatt,
          installationMultiplier: data.installationMultiplier,
          gstRate: data.gstRate,
          irradiance_kWh_m2_day: irradiance,
        },
        locationLabel
      );

      return res.json({
        ...result,
        weather: null,
        fallback: "Weather API unavailable; used India average irradiance",
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
        errors: err.issues,
      });
    }
    return next(err);
  }
});
