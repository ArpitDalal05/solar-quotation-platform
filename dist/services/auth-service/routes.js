"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../../shared/prisma");
const auth_1 = require("../../shared/middleware/auth");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["ADMIN", "SALES_EXECUTIVE", "DESIGN_ENGINEER", "MANAGER"]),
});
const customerSignupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(5),
    state: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.authRouter.post("/register", async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        const role = await prisma_1.prisma.role.upsert({
            where: { name: data.role },
            update: {},
            create: { name: data.role },
        });
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const hashed = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashed,
                roleId: role.id,
            },
            include: { role: true },
        });
        const token = (0, auth_1.generateToken)({ id: user.id, role: user.role.name });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
// Public customer signup (creates both User + Customer record)
exports.authRouter.post("/signup", async (req, res, next) => {
    try {
        const data = customerSignupSchema.parse(req.body);
        const role = await prisma_1.prisma.role.upsert({
            where: { name: "CUSTOMER" },
            update: {},
            create: { name: "CUSTOMER" },
        });
        const existing = await prisma_1.prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { phone: data.phone }] },
            include: { role: true },
        });
        if (existing) {
            return res.status(400).json({ message: "Email or phone already in use" });
        }
        const hashed = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.user.create({
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
        const token = (0, auth_1.generateToken)({ id: user.id, role: user.role.name });
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
exports.authRouter.get("/me", auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
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
    }
    catch (err) {
        return next(err);
    }
});
exports.authRouter.post("/login", async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            include: { role: true },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const match = await bcryptjs_1.default.compare(data.password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, auth_1.generateToken)({ id: user.id, role: user.role.name });
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: err.issues });
        }
        return next(err);
    }
});
