import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma";
import { authMiddleware, requireRoles } from "../../shared/middleware/auth";

export const pricingRouter = Router();

pricingRouter.use(authMiddleware);

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().optional(),
  cost_per_watt: z.number().positive(),
});

const pricingConfigSchema = z.object({
  structure_type_cost: z.number().nonnegative(),
  cabling_cost_per_watt: z.number().nonnegative(),
  installation_cost_per_watt: z.number().nonnegative(),
  transport_cost: z.number().nonnegative(),
  margin_percent: z.number().nonnegative(),
  margin_per_watt: z.number().nonnegative().optional(),
  gst_rate: z.number().nonnegative(),
});

pricingRouter.post(
  "/products",
  requireRoles(["ADMIN"]),
  async (req, res, next) => {
    try {
      const data = productSchema.parse(req.body);
      const product = await prisma.product.create({
        data: {
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          costPerWatt: data.cost_per_watt,
        },
      });
      return res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.issues });
      }
      return next(err);
    }
  },
);

pricingRouter.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(products);
  } catch (err) {
    return next(err);
  }
});

pricingRouter.get("/products/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (err) {
    return next(err);
  }
});

pricingRouter.put(
  "/products/:id",
  requireRoles(["ADMIN"]),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = productSchema.partial().parse(req.body);
      const product = await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          costPerWatt: data.cost_per_watt,
        },
      });
      return res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.issues });
      }
      return next(err);
    }
  },
);

pricingRouter.delete(
  "/products/:id",
  requireRoles(["ADMIN"]),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await prisma.product.delete({ where: { id } });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },
);

pricingRouter.post(
  "/configs",
  requireRoles(["ADMIN"]),
  async (req, res, next) => {
    try {
      const data = pricingConfigSchema.parse(req.body);
      const config = await prisma.pricingConfig.create({
        data: {
          structureTypeCost: data.structure_type_cost,
          cablingCostPerWatt: data.cabling_cost_per_watt,
          installationCostPerWatt: data.installation_cost_per_watt,
          transportCost: data.transport_cost,
          marginPercent: data.margin_percent,
          marginPerWatt: data.margin_per_watt,
          gstRate: data.gst_rate,
        },
      });
      return res.status(201).json(config);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.issues });
      }
      return next(err);
    }
  },
);

pricingRouter.get("/configs/latest", async (_req, res, next) => {
  try {
    const config = await prisma.pricingConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return res.json(config);
  } catch (err) {
    return next(err);
  }
});

