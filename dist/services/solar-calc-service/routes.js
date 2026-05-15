"use strict";
/**
 * Solar Calculator API
 * POST /solar-calc – accepts city or coordinates, returns full solar calculation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.solarCalcRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const weatherService_1 = require("./weatherService");
const irradianceService_1 = require("./irradianceService");
const calculationEngine_1 = require("./calculationEngine");
exports.solarCalcRouter = (0, express_1.Router)();
const solarCalcSchema = zod_1.z.object({
    city: zod_1.z.string().min(1).optional(),
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lon: zod_1.z.number().min(-180).max(180).optional(),
    monthlyConsumption: zod_1.z.number().positive(),
    electricityRate: zod_1.z.number().positive().default(8),
    panelWattage: zod_1.z.number().positive().default(400),
    efficiency: zod_1.z.number().min(0).max(1).default(0.75),
    costPerWatt: zod_1.z.number().positive().default(80),
    installationMultiplier: zod_1.z.number().min(0).max(1).default(0.1),
    gstRate: zod_1.z.number().min(0).max(1).default(0.18),
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
exports.solarCalcRouter.post("/", async (req, res, next) => {
    try {
        const data = solarCalcSchema.parse(req.body);
        if (!data.city && (data.lat == null || data.lon == null)) {
            return res.status(400).json({
                message: "Provide either city or lat/lon coordinates",
            });
        }
        let irradiance;
        let locationLabel;
        try {
            const weather = await (0, weatherService_1.fetchWeatherData)({
                city: data.city,
                lat: data.lat,
                lon: data.lon,
            });
            irradiance = (0, irradianceService_1.estimateIrradiance)(weather.coordinates.lat, weather.cloudCover);
            locationLabel = weather.city
                ? `${weather.city}, ${weather.country}`
                : `${weather.coordinates.lat}, ${weather.coordinates.lon}`;
            // Run calculation with weather-derived irradiance
            const result = (0, calculationEngine_1.runSolarCalculation)({
                monthlyConsumption: data.monthlyConsumption,
                electricityRate: data.electricityRate,
                panelWattage: data.panelWattage,
                efficiency: data.efficiency,
                costPerWatt: data.costPerWatt,
                installationMultiplier: data.installationMultiplier,
                gstRate: data.gstRate,
                irradiance_kWh_m2_day: irradiance,
            }, locationLabel);
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
        }
        catch (weatherErr) {
            // Fallback: use India average irradiance when weather API fails
            irradiance = (0, irradianceService_1.getDefaultIrradiance)();
            locationLabel = data.city || "India (default)";
            const result = (0, calculationEngine_1.runSolarCalculation)({
                monthlyConsumption: data.monthlyConsumption,
                electricityRate: data.electricityRate,
                panelWattage: data.panelWattage,
                efficiency: data.efficiency,
                costPerWatt: data.costPerWatt,
                installationMultiplier: data.installationMultiplier,
                gstRate: data.gstRate,
                irradiance_kWh_m2_day: irradiance,
            }, locationLabel);
            return res.json({
                ...result,
                weather: null,
                fallback: "Weather API unavailable; used India average irradiance",
            });
        }
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "Invalid input",
                errors: err.issues,
            });
        }
        return next(err);
    }
});
