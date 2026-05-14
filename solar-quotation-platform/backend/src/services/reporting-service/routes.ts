import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { authMiddleware, requireRoles } from "../../shared/middleware/auth";

export const reportingRouter = Router();

reportingRouter.use(authMiddleware);

// Sales Executive dashboard – own quotations and pipeline (no role restriction)
reportingRouter.get("/sales-dashboard", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const myQuotations = await prisma.quotation.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const myMonthlyCount = myQuotations.filter(
      (q) => new Date(q.createdAt) >= monthStart
    ).length;
    const myTotalValue = myQuotations.reduce((s, q) => s + q.netPayableAmount, 0);

    return res.json({
      totalQuotations: myQuotations.length,
      monthlyPipeline: myMonthlyCount,
      totalValue: myTotalValue,
      recentQuotations: myQuotations.slice(0, 5),
    });
  } catch (err) {
    return next(err);
  }
});

reportingRouter.use(requireRoles(["ADMIN", "MANAGER"]));

reportingRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const totalQuotations = await prisma.quotation.count();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyQuotations = await prisma.quotation.findMany({
      where: { createdAt: { gte: monthStart } },
    });

    const acceptedCount = await prisma.quotation.count({
      where: { status: "ACCEPTED" },
    });
    const conversionRatio =
      totalQuotations === 0 ? 0 : acceptedCount / totalQuotations;

    const totalValueAggregate = await prisma.quotation.aggregate({
      _sum: { netPayableAmount: true },
    });
    const totalValue = totalValueAggregate._sum.netPayableAmount ?? 0;
    const revenueForecast = totalValue * conversionRatio;

    const salesPerformance = await prisma.quotation.groupBy({
      by: ["userId"],
      _count: { _all: true },
      _sum: { netPayableAmount: true },
    });

    return res.json({
      totalQuotations,
      monthlySalesPipeline: monthlyQuotations.length,
      conversionRatio,
      revenueForecast,
      salesExecutivePerformance: salesPerformance,
    });
  } catch (err) {
    return next(err);
  }
});


