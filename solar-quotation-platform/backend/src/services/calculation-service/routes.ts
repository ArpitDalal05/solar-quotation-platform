import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma";
import { authMiddleware } from "../../shared/middleware/auth";
import { getGenerationFactorByState } from "./generationFactors";

export const calculationRouter = Router();

const calculationInputSchema = z.object({
  customerId: z.number().optional(),
  monthly_electricity_bill: z.number().optional(),
  connected_load: z.number().optional(),
  electricity_tariff: z.number().positive(),
  state: z.string().min(1),
  roof_type: z.enum(["RCC", "SHEET", "GROUND"]),
  panel_wattage: z.number().positive().default(540),
  system_efficiency: z.number().positive().max(1).default(0.8),
});

calculationRouter.use(authMiddleware);

// Customer-saved calculations (from solar calculator UI)
const customerCalculationSaveSchema = z.object({
  monthly_consumption: z.number().positive(),
  irradiance: z.number().positive(),
  system_capacity_kw: z.number().positive(),
  number_of_panels: z.number().int().positive(),
  annual_generation: z.number().positive(),
  annual_savings: z.number().nonnegative(),
  total_system_cost: z.number().nonnegative(),
  payback_years: z.number().nonnegative(),
});

calculationRouter.post("/save", async (req, res, next) => {
  try {
    const data = customerCalculationSaveSchema.parse(req.body);
    const created = await prisma.calculation.create({
      data: {
        userId: req.user!.id,
        monthlyConsumption: data.monthly_consumption,
        irradiance: data.irradiance,
        systemCapacityKw: data.system_capacity_kw,
        panels: data.number_of_panels,
        annualGeneration: data.annual_generation,
        annualSavings: data.annual_savings,
        totalCost: data.total_system_cost,
        payback: data.payback_years,
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

calculationRouter.get("/my", async (req, res, next) => {
  try {
    const rows = await prisma.calculation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

calculationRouter.get("/by-customer/:customerId", async (req, res, next) => {
  try {
    const customerId = Number(req.params.customerId);
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return res.json([]);

    // Prefer staff- and system-generated calculations that are explicitly tied
    // to this customer via SolarCalculation.customerId.
    const solarCalcs = await prisma.solarCalculation.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Map to the shape expected by the frontend (Quotations page)
    const mapped = solarCalcs.map((c) => ({
      id: c.id,
      systemCapacityKw: c.plantCapacityKw,
      annualGeneration: c.annualGenerationKwh,
      createdAt: c.createdAt,
    }));

    // If none found, fall back to older customer-saved Calculation entries
    if (mapped.length === 0 && customer.userId) {
      const legacy = await prisma.calculation.findMany({
        where: { userId: customer.userId },
        orderBy: { createdAt: "desc" },
      });
      return res.json(legacy);
    }

    return res.json(mapped);
  } catch (err) {
    return next(err);
  }
});

calculationRouter.get("/generation-factor", (req, res) => {
  const state = String(req.query.state || "");
  if (!state.trim()) {
    return res.status(400).json({ message: "state is required" });
  }
  const factor = getGenerationFactorByState(state);
  return res.json({ state, generationFactor: factor });
});

calculationRouter.post("/", async (req, res, next) => {
  try {
    const data = calculationInputSchema.parse(req.body);

    const generationFactor = getGenerationFactorByState(data.state);

    const monthlyBasis =
      data.monthly_electricity_bill ??
      (data.connected_load ? data.connected_load * data.electricity_tariff * 30 : 0);

    if (!monthlyBasis) {
      return res
        .status(400)
        .json({ message: "Provide monthly_electricity_bill or connected_load" });
    }

    // plant_size_kw = monthly_bill / tariff / generation_factor
    const plantCapacityKw =
      monthlyBasis / data.electricity_tariff / (generationFactor * 30);

    const annualGenerationKwh =
      plantCapacityKw * generationFactor * 365 * data.system_efficiency;

    const numberOfPanels = Math.ceil(
      (plantCapacityKw * 1000) / data.panel_wattage,
    );

    const inverterCapacityKw = plantCapacityKw;

    const shadowFreeAreaRequired = plantCapacityKw * 100; // rough 100 sq.ft per kW

    const calc = await prisma.solarCalculation.create({
      data: {
        customerId: data.customerId,
        monthlyBill: data.monthly_electricity_bill,
        connectedLoad: data.connected_load,
        state: data.state,
        roofType: data.roof_type,
        plantCapacityKw,
        annualGenerationKwh,
        numberOfPanels,
        inverterCapacityKw,
        shadowFreeAreaRequired,
      },
    });

    return res.status(201).json(calc);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

calculationRouter.get("/", async (_req, res, next) => {
  try {
    const calculations = await prisma.solarCalculation.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, financialAnalysis: true },
    });
    return res.json(calculations);
  } catch (err) {
    return next(err);
  }
});

const saveFromSolarCalcSchema = z.object({
  customer_id: z.number().optional(),
  state: z.string().min(1).default("Maharashtra"),
  roof_type: z.enum(["RCC", "SHEET", "GROUND"]).default("RCC"),
  monthly_bill: z.number().optional(),
  systemCapacity_kW: z.number().positive(),
  numberOfPanels: z.number().int().positive(),
  annualGeneration_kWh: z.number().positive(),
});

calculationRouter.post("/from-solar-calc", async (req, res, next) => {
  try {
    const data = saveFromSolarCalcSchema.parse(req.body);
    const plantCapacityKw = data.systemCapacity_kW;
    const inverterCapacityKw = plantCapacityKw;
    const shadowFreeAreaRequired = plantCapacityKw * 100;

    const calc = await prisma.solarCalculation.create({
      data: {
        customerId: data.customer_id,
        monthlyBill: data.monthly_bill,
        state: data.state,
        roofType: data.roof_type,
        plantCapacityKw,
        annualGenerationKwh: data.annualGeneration_kWh,
        numberOfPanels: data.numberOfPanels,
        inverterCapacityKw,
        shadowFreeAreaRequired,
      },
    });

    return res.status(201).json(calc);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

calculationRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const calculation = await prisma.solarCalculation.findUnique({
      where: { id },
      include: { customer: true, financialAnalysis: true },
    });
    if (!calculation) {
      return res.status(404).json({ message: "Calculation not found" });
    }
    return res.json(calculation);
  } catch (err) {
    return next(err);
  }
});

