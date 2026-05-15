import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma";
import { authMiddleware, requireRoles } from "../../shared/middleware/auth";

export const customerRouter = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  state: z.string().min(1),
  electricity_tariff: z.number().positive(),
  sanctioned_load: z.number().nonnegative(),
  contact_number: z.string().min(5),
  email: z.string().email(),
  followup_status: z.string().optional(),
  notes: z.string().optional(),
});

customerRouter.use(authMiddleware);

customerRouter.post(
  "/",
  requireRoles(["ADMIN", "SALES_EXECUTIVE", "MANAGER"]),
  async (req, res, next) => {
    try {
      const data = customerSchema.parse(req.body);
      const created = await prisma.customer.create({
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.issues });
      }
      return next(err);
    }
  },
);

customerRouter.get("/", async (_req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(customers);
  } catch (err) {
    return next(err);
  }
});

customerRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.json(customer);
  } catch (err) {
    return next(err);
  }
});

customerRouter.put(
  "/:id",
  requireRoles(["ADMIN", "SALES_EXECUTIVE", "MANAGER"]),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = customerSchema.partial().parse(req.body);
      const updated = await prisma.customer.update({
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.issues });
      }
      return next(err);
    }
  },
);

customerRouter.delete(
  "/:id",
  requireRoles(["ADMIN", "MANAGER"]),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await prisma.customer.delete({ where: { id } });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },
);

