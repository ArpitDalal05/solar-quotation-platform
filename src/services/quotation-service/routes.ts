import path from "path";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma";
import { authMiddleware } from "../../shared/middleware/auth";
import { generateQuotationPdf } from "./pdfGenerator";

export const quotationRouter = Router();

quotationRouter.use(authMiddleware);

const quotationCreateSchema = z.object({
  customer_id: z.number().optional(),
  customer_name: z.string().min(1).optional(),
  calculation_id: z.number(),
  subsidy_percent: z.number().nonnegative().max(100).default(0),
  electricity_tariff: z.number().positive(),
});

quotationRouter.post("/", async (req, res, next) => {
  try {
    const data = quotationCreateSchema.parse(req.body);

    const customer = data.customer_id
      ? await prisma.customer.findUnique({ where: { id: data.customer_id } })
      : null;

    const customerName = customer?.name ?? data.customer_name;
    if (!customerName) {
      return res.status(400).json({
        message: "customer_name is required when customer_id is not provided",
      });
    }

    // Try finding in Calculation table
    let calculation = await prisma.calculation.findUnique({
      where: { id: data.calculation_id },
    });

    let solarCalculation = null;
    let financialAnalysisId = null;

    if (!calculation) {
      // Try finding in SolarCalculation table
      solarCalculation = await prisma.solarCalculation.findUnique({
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
      } else {
        // Create a default financial analysis if missing
        const totalProjectCost = solarCalculation.plantCapacityKw * 60000;
        const subsidyAmount = (totalProjectCost * data.subsidy_percent) / 100;
        const netPayableAmount = totalProjectCost - subsidyAmount;
        const annualSavings = solarCalculation.annualGenerationKwh * data.electricity_tariff;

        const newFinancial = await prisma.financialAnalysis.create({
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
    const totalAmount = calculation ? calculation.totalCost : (solarCalculation!.plantCapacityKw * 60000);
    const subsidyAmount = (totalAmount * data.subsidy_percent) / 100;
    const netPayableAmount = totalAmount - subsidyAmount;

    const quotationNumber = `SOL-${Date.now()}`;

    const createdBy = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: true },
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: customer?.id,
        customerName,
        userId: req.user!.id,
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
      await generateQuotationPdf({
        companyName: process.env.COMPANY_NAME || "Solar PV Solutions Pvt. Ltd.",
        customer,
        quotation,
        calculation: calculation || (solarCalculation as any),
        financial: null,
      }).then(async ({ filePath }) => {
        const relative = `/files/quotations/${path.basename(filePath)}`;
        await prisma.quotation.update({
          where: { id: quotation.id },
          data: { pdfUrl: relative },
        });
      }).catch(err => console.error("PDF Gen Error:", err));
    }

    return res.status(201).json(quotation);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

quotationRouter.get("/", async (_req, res, next) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: { customer: true, user: true, calculation: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(quotations);
  } catch (err) {
    return next(err);
  }
});

quotationRouter.get("/my", async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!customer) return res.json([]);
    const quotations = await prisma.quotation.findMany({
      where: { customerId: customer.id },
      include: { calculation: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(quotations);
  } catch (err) {
    return next(err);
  }
});

const quotationStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]),
});

quotationRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = quotationStatusSchema.parse(req.body);
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: data.status },
    });
    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

quotationRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const quotation = await prisma.quotation.findUnique({
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
  } catch (err) {
    return next(err);
  }
});
