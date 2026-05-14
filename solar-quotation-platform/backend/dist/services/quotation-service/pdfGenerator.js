"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuotationPdf = generateQuotationPdf;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateQuotationPdf(data) {
    const storageDir = path_1.default.join(process.cwd(), "storage", "quotations");
    fs_1.default.mkdirSync(storageDir, { recursive: true });
    const fileName = `quotation-${data.quotation.quotationNumber}.pdf`;
    const filePath = path_1.default.join(storageDir, fileName);
    const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
    const stream = fs_1.default.createWriteStream(filePath);
    doc.pipe(stream);
    // Cover / header
    doc
        .fontSize(22)
        .fillColor("#1e293b")
        .text(data.companyName, { align: "center" })
        .moveDown();
    doc
        .fontSize(16)
        .fillColor("#0f766e")
        .text("Solar PV System Quotation", { align: "center" })
        .moveDown(2);
    doc
        .fontSize(12)
        .fillColor("#111827")
        .text(`Quotation No: ${data.quotation.quotationNumber}`)
        .text(`Date: ${data.quotation.createdAt.toDateString()}`)
        .moveDown();
    doc
        .fontSize(12)
        .text("Customer Details", { underline: true })
        .moveDown(0.5);
    doc
        .text(`Name: ${data.customer.name}`)
        .text(`Location: ${data.customer.location || "-"}`)
        .text(`State: ${data.customer.state || "-"}`)
        .text(`Contact: ${data.customer.contactNumber || "-"}`)
        .text(`Email: ${data.customer.email || "-"}`)
        .moveDown();
    // Technical specifications
    doc.text("Technical Specifications", { underline: true }).moveDown(0.5);
    if (data.calculation) {
        doc
            .text(`Plant Capacity: ${data.calculation.systemCapacityKw.toFixed(2)} kW`)
            .text(`Estimated Annual Generation: ${data.calculation.annualGeneration.toFixed(0)} kWh`)
            .text(`Number of Panels: ${data.calculation.panels}`)
            .text(`Irradiance: ${data.calculation.irradiance.toFixed(2)} kWh/m²/day`)
            .moveDown();
    }
    else {
        doc.text("Technical details will be shared separately.").moveDown();
    }
    // Financial analysis
    doc.text("Financial Analysis", { underline: true }).moveDown(0.5);
    if (data.financial) {
        doc
            .text(`Total Project Cost: ₹${data.financial.totalProjectCost.toFixed(2)}`)
            .text(`Subsidy Amount: ₹${data.financial.subsidyAmount.toFixed(2)}`)
            .text(`Net Payable Amount: ₹${data.financial.netPayableAmount.toFixed(2)}`)
            .text(`Annual Savings: ₹${data.financial.annualSavings.toFixed(2)}`)
            .text(`Payback Period: ${data.financial.paybackPeriodYears.toFixed(1)} years`)
            .text(`25-Year Savings Projection: ₹${data.financial.savings25Years.toFixed(2)}`)
            .moveDown();
    }
    else {
        doc.text("Financial details will be shared separately.").moveDown();
    }
    // Scope, exclusions, terms
    doc.text("Scope of Work", { underline: true }).moveDown(0.5);
    doc
        .text("- Design, supply, installation and commissioning of rooftop solar PV system.")
        .text("- Liaisoning support for net-metering and approvals.")
        .moveDown();
    doc.text("Exclusions", { underline: true }).moveDown(0.5);
    doc
        .text("- Civil works not explicitly mentioned.")
        .text("- Any additional structural reinforcement if required by site conditions.")
        .moveDown();
    doc.text("Payment Terms", { underline: true }).moveDown(0.5);
    doc
        .text("40% advance along with work order.")
        .text("50% on material delivery at site.")
        .text("10% on successful commissioning.")
        .moveDown();
    doc.text("Warranty & Terms", { underline: true }).moveDown(0.5);
    doc
        .text("Standard manufacturer warranties on modules and inverters as per OEM terms.")
        .text("Workmanship warranty of 1 year from commissioning date.")
        .moveDown();
    doc.text("This is a system-generated quotation. For any clarification, please contact our sales team.");
    doc.end();
    await new Promise((resolve, reject) => {
        stream.on("finish", () => resolve());
        stream.on("error", (err) => reject(err));
    });
    return { filePath };
}
