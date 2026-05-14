"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("express");
const path_1 = __importDefault(require("path"));
const routes_1 = require("./services/auth-service/routes");
const routes_2 = require("./services/customer-service/routes");
const routes_3 = require("./services/pricing-service/routes");
const routes_4 = require("./services/calculation-service/routes");
const routes_5 = require("./services/quotation-service/routes");
const routes_6 = require("./services/reporting-service/routes");
const routes_7 = require("./services/solar-calc-service/routes");
const errorHandler_1 = require("./shared/middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, express_2.json)());
app.use((0, morgan_1.default)("combined"));
// Static files for generated PDFs
const filesDir = path_1.default.join(process.cwd(), "storage");
app.use("/files", express_1.default.static(filesDir));
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/auth", routes_1.authRouter);
app.use("/customers", routes_2.customerRouter);
app.use("/pricing", routes_3.pricingRouter);
app.use("/calculations", routes_4.calculationRouter);
app.use("/quotations", routes_5.quotationRouter);
app.use("/reports", routes_6.reportingRouter);
app.use("/solar-calc", routes_7.solarCalcRouter);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${PORT}`);
});
