"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../shared/prisma");
const auth_1 = require("../../shared/middleware/auth");
exports.customerRouter = (0, express_1.Router)();
const customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    location: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    electricity_tariff: zod_1.z.number().positive(),
    sanctioned_load: zod_1.z.number().nonnegative(),
    contact_number: zod_1.z.string().min(5),
    email: zod_1.z.string().email(),
    followup_status: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.customerRouter.use(auth_1.authMiddleware);
exports.customerRouter.post("/", (0, auth_1.requireRoles)(["ADMIN", "SALES_EXECUTIVE", "MANAGER"]), async (req, res, next) => {
    try {
        const data = customerSchema.parse(req.body);
        const created = await prisma_1.prisma.customer.create({
            data: {
                name: data.name,
                location: data.location,
                state: data.state,
                electricityTariff: data.electricity_tariff,
                sanctionedLoad: data.sanctioned_load,
                contactNumber: data.contact_number,
                email: data.email,
                followupStatus: data.followup_status,
                notes: data.notes,
            },
        });
        return res.status(201).json(created);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.customerRouter.get("/", async (_req, res, next) => {
    try {
        const customers = await prisma_1.prisma.customer.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.json(customers);
    }
    catch (err) {
        return next(err);
    }
});
exports.customerRouter.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const customer = await prisma_1.prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.json(customer);
    }
    catch (err) {
        return next(err);
    }
});
exports.customerRouter.put("/:id", (0, auth_1.requireRoles)(["ADMIN", "SALES_EXECUTIVE", "MANAGER"]), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = customerSchema.partial().parse(req.body);
        const updated = await prisma_1.prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location,
                state: data.state,
                electricityTariff: data.electricity_tariff,
                sanctionedLoad: data.sanctioned_load,
                contactNumber: data.contact_number,
                email: data.email,
                followupStatus: data.followup_status,
                notes: data.notes,
            },
        });
        return res.json(updated);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.customerRouter.delete("/:id", (0, auth_1.requireRoles)(["ADMIN", "MANAGER"]), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.customer.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        return next(err);
    }
});
