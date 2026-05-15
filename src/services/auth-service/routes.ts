import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../shared/prisma";
import { generateToken, authMiddleware } from "../../shared/middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SALES_EXECUTIVE", "DESIGN_ENGINEER", "MANAGER"]),
});

const customerSignupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  state: z.string().min(1),
  city: z.string().min(1),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const role = await prisma.role.upsert({
      where: { name: data.role },
      update: {},
      create: { name: data.role },
    });

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        roleId: role.id,
      },
      include: { role: true },
    });

    const token = generateToken({ id: user.id, role: user.role.name });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

// Public customer signup (creates both User + Customer record)
authRouter.post("/signup", async (req, res, next) => {
  try {
    const data = customerSignupSchema.parse(req.body);

    const role = await prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER" },
    });

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
      include: { role: true },
    });
    if (existing) {
      return res.status(400).json({ message: "Email or phone already in use" });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        city: data.city,
        password: hashed,
        roleId: role.id,
        customer: {
          create: {
            name: data.name,
            contactNumber: data.phone,
            email: data.email,
            state: data.state,
            location: data.city,
          },
        },
      },
      include: { role: true },
    });

    const token = generateToken({ id: user.id, role: user.role.name });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        city: user.city,
        role: user.role.name,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      city: user.city,
      role: user.role.name,
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, role: user.role.name });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: err.issues });
    }
    return next(err);
  }
});

