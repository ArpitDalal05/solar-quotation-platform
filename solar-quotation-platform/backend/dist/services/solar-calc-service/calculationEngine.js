"use strict";
/**
 * Solar Calculation Engine
 * Uses predefined formulas for system sizing and financial estimates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSolarCalculation = runSolarCalculation;
/**
 * Runs the full solar calculation using the standard formulas.
 */
function runSolarCalculation(inputs, location = "") {
    const { monthlyConsumption, electricityRate, panelWattage, efficiency, costPerWatt, installationMultiplier, gstRate, irradiance_kWh_m2_day, } = inputs;
    // DailyConsumption = MonthlyConsumption / 30
    const dailyConsumption = monthlyConsumption / 30;
    // SystemCapacity_kW = DailyConsumption / (Irradiance_kWh_m2_day * Efficiency)
    const systemCapacity_kW = dailyConsumption / (irradiance_kWh_m2_day * efficiency);
    // NumPanels = ceil((SystemCapacity_kW * 1000) / PanelWattage)
    const numberOfPanels = Math.ceil((systemCapacity_kW * 1000) / panelWattage);
    // AnnualGeneration = SystemCapacity_kW * Irradiance_kWh_m2_day * 365 * Efficiency
    const annualGeneration_kWh = systemCapacity_kW * irradiance_kWh_m2_day * 365 * efficiency;
    // AnnualSavings = AnnualGeneration * ElectricityRate
    const annualSavings = annualGeneration_kWh * electricityRate;
    // BaseCost = SystemCapacity_kW * 1000 * CostPerWatt
    const baseCost = systemCapacity_kW * 1000 * costPerWatt;
    // InstallationCost = BaseCost * InstallationMultiplier
    const installationCost = baseCost * installationMultiplier;
    // TotalCost = (BaseCost + InstallationCost) * (1 + GST_RATE)
    const totalSystemCost = (baseCost + installationCost) * (1 + gstRate);
    // PaybackYears = TotalCost / AnnualSavings (avoid division by zero)
    const paybackPeriod_years = annualSavings > 0 ? totalSystemCost / annualSavings : 0;
    return {
        location,
        irradiance: Math.round(irradiance_kWh_m2_day * 100) / 100,
        systemCapacity_kW: Math.round(systemCapacity_kW * 100) / 100,
        numberOfPanels,
        annualGeneration_kWh: Math.round(annualGeneration_kWh),
        annualSavings: Math.round(annualSavings),
        totalSystemCost: Math.round(totalSystemCost),
        paybackPeriod_years: Math.round(paybackPeriod_years * 10) / 10,
    };
}
