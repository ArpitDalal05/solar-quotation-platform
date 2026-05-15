import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { json } from "express";
import path from "path";
import { authRouter } from "./services/auth-service/routes";
import { customerRouter } from "./services/customer-service/routes";
import { pricingRouter } from "./services/pricing-service/routes";
import { calculationRouter } from "./services/calculation-service/routes";
import { quotationRouter } from "./services/quotation-service/routes";
import { reportingRouter } from "./services/reporting-service/routes";
import { solarCalcRouter } from "./services/solar-calc-service/routes";
import { errorHandler } from "./shared/middleware/errorHandler";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());
app.use(morgan("combined"));

// Static files for generated PDFs
const filesDir = path.join(process.cwd(), "storage");
app.use("/files", express.static(filesDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/customers", customerRouter);
app.use("/pricing", pricingRouter);
app.use("/calculations", calculationRouter);
app.use("/quotations", quotationRouter);
app.use("/reports", reportingRouter);
app.use("/solar-calc", solarCalcRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});

