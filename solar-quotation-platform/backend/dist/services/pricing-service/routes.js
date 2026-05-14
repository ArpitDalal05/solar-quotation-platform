"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../shared/prisma");
const auth_1 = require("../../shared/middleware/auth");
exports.pricingRouter = (0, express_1.Router)();
exports.pricingRouter.use(auth_1.authMiddleware);
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    brand: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    cost_per_watt: zod_1.z.number().positive(),
});
const pricingConfigSchema = zod_1.z.object({
    structure_type_cost: zod_1.z.number().nonnegative(),
    cabling_cost_per_watt: zod_1.z.number().nonnegative(),
    installation_cost_per_watt: zod_1.z.number().nonnegative(),
    transport_cost: zod_1.z.number().nonnegative(),
    margin_percent: zod_1.z.number().nonnegative(),
    margin_per_watt: zod_1.z.number().nonnegative().optional(),
    gst_rate: zod_1.z.number().nonnegative(),
});
exports.pricingRouter.post("/products", (0, auth_1.requireRoles)(["ADMIN"]), async (req, res, next) => {
    try {
        const data = productSchema.parse(req.body);
        const product = await prisma_1.prisma.product.create({
            data: {
                name: data.name,
                category: data.category,
                brand: data.brand,
                description: data.description,
                costPerWatt: data.cost_per_watt,
            },
        });
        return res.status(201).json(product);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.pricingRouter.get("/products", async (_req, res, next) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.json(products);
    }
    catch (err) {
        return next(err);
    }
});
exports.pricingRouter.get("/products/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(product);
    }
    catch (err) {
        return next(err);
    }
});
exports.pricingRouter.put("/products/:id", (0, auth_1.requireRoles)(["ADMIN"]), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = productSchema.partial().parse(req.body);
        const product = await prisma_1.prisma.product.update({
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.pricingRouter.delete("/products/:id", (0, auth_1.requireRoles)(["ADMIN"]), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.product.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        return next(err);
    }
});
exports.pricingRouter.post("/configs", (0, auth_1.requireRoles)(["ADMIN"]), async (req, res, next) => {
    try {
        const data = pricingConfigSchema.parse(req.body);
        const config = await prisma_1.prisma.pricingConfig.create({
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.pricingRouter.get("/configs/latest", async (_req, res, next) => {
    try {
        const config = await prisma_1.prisma.pricingConfig.findFirst({
            orderBy: { createdAt: "desc" },
        });
        return res.json(config);
    }
    catch (err) {
        return next(err);
    }
});
