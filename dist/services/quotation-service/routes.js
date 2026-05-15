"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotationRouter = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../shared/prisma");
const auth_1 = require("../../shared/middleware/auth");
const pdfGenerator_1 = require("./pdfGenerator");
exports.quotationRouter = (0, express_1.Router)();
exports.quotationRouter.use(auth_1.authMiddleware);
const quotationCreateSchema = zod_1.z.object({
    customer_id: zod_1.z.number().optional(),
    customer_name: zod_1.z.string().min(1).optional(),
    calculation_id: zod_1.z.number(),
    subsidy_percent: zod_1.z.number().nonnegative().max(100).default(0),
    electricity_tariff: zod_1.z.number().positive(),
});
exports.quotationRouter.post("/", async (req, res, next) => {
    try {
        const data = quotationCreateSchema.parse(req.body);
        const customer = data.customer_id
            ? await prisma_1.prisma.customer.findUnique({ where: { id: data.customer_id } })
            : null;
        const customerName = customer?.name ?? data.customer_name;
        if (!customerName) {
            return res.status(400).json({
                message: "customer_name is required when customer_id is not provided",
            });
        }
        // Try finding in Calculation table
        let calculation = await prisma_1.prisma.calculation.findUnique({
            where: { id: data.calculation_id },
        });
        let solarCalculation = null;
        let financialAnalysisId = null;
        if (!calculation) {
            // Try finding in SolarCalculation table
            solarCalculation = await prisma_1.prisma.solarCalculation.findUnique({
                where: { id: data.calculation_id },
                include: { financialAnalysis: true }
            });
            if (!solarCalculation) {
                return res.status(404).json({ message: "Calculation not found in any table" });
            }
            // If SolarCalculation exists, ensure it has a FinancialAnalysis record
            // Quotation model can link to financialAnalysisId
            if (solarCalculation.financialAnalysis) {
                financialAnalysisId = solarCalculation.financialAnalysis.id;
            }
            else {
                // Create a default financial analysis if missing
                const totalProjectCost = solarCalculation.plantCapacityKw * 60000;
                const subsidyAmount = (totalProjectCost * data.subsidy_percent) / 100;
                const netPayableAmount = totalProjectCost - subsidyAmount;
                const annualSavings = solarCalculation.annualGenerationKwh * data.electricity_tariff;
                const newFinancial = await prisma_1.prisma.financialAnalysis.create({
                    data: {
                        calculationId: solarCalculation.id,
                        totalProjectCost,
                        subsidyAmount,
                        netPayableAmount,
                        annualSavings,
                        paybackPeriodYears: annualSavings > 0 ? netPayableAmount / annualSavings : 5,
                        savings25Years: annualSavings * 25,
                    }
                });
                financialAnalysisId = newFinancial.id;
            }
        }
        // Prepare quotation data
        const totalAmount = calculation ? calculation.totalCost : (solarCalculation.plantCapacityKw * 60000);
        const subsidyAmount = (totalAmount * data.subsidy_percent) / 100;
        const netPayableAmount = totalAmount - subsidyAmount;
        const quotationNumber = `SOL-${Date.now()}`;
        const createdBy = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { role: true },
        });
        const quotation = await prisma_1.prisma.quotation.create({
            data: {
                quotationNumber,
                customerId: customer?.id,
                customerName,
                userId: req.user.id,
                calculationId: calculation ? calculation.id : null,
                financialAnalysisId: financialAnalysisId,
                salesExecutive: createdBy?.role.name === "SALES_EXECUTIVE" ? createdBy.name : null,
                totalAmount,
                netPayableAmount,
                subsidyAmount,
                status: "DRAFT",
            },
        });
        // Generate PDF if we have a customer
        if (customer) {
            await (0, pdfGenerator_1.generateQuotationPdf)({
                companyName: process.env.COMPANY_NAME || "Solar PV Solutions Pvt. Ltd.",
                customer,
                quotation,
                calculation: calculation || solarCalculation,
                financial: null,
            }).then(async ({ filePath }) => {
                const relative = `/files/quotations/${path_1.default.basename(filePath)}`;
                await prisma_1.prisma.quotation.update({
                    where: { id: quotation.id },
                    data: { pdfUrl: relative },
                });
            }).catch(err => console.error("PDF Gen Error:", err));
        }
        return res.status(201).json(quotation);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.quotationRouter.get("/", async (_req, res, next) => {
    try {
        const quotations = await prisma_1.prisma.quotation.findMany({
            include: { customer: true, user: true, calculation: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json(quotations);
    }
    catch (err) {
        return next(err);
    }
});
exports.quotationRouter.get("/my", async (req, res, next) => {
    try {
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { userId: req.user.id },
        });
        if (!customer)
            return res.json([]);
        const quotations = await prisma_1.prisma.quotation.findMany({
            where: { customerId: customer.id },
            include: { calculation: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json(quotations);
    }
    catch (err) {
        return next(err);
    }
});
const quotationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]),
});
exports.quotationRouter.patch("/:id/status", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = quotationStatusSchema.parse(req.body);
        const updated = await prisma_1.prisma.quotation.update({
            where: { id },
            data: { status: data.status },
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
exports.quotationRouter.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const quotation = await prisma_1.prisma.quotation.findUnique({
            where: { id },
            include: {
                customer: true,
                user: true,
                calculation: true,
            },
        });
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }
        return res.json(quotation);
    }
    catch (err) {
        return next(err);
    }
});
