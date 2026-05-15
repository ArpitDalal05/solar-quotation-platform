import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Customer, FinancialAnalysis, Quotation } from "@prisma/client";

interface PdfData {
  companyName: string;
  customer: Customer;
  quotation: Quotation;
  calculation?: any; 
  financial?: FinancialAnalysis | null;
}

export async function generateQuotationPdf(
  data: PdfData,
): Promise<{ filePath: string }> {
  const storageDir = path.join(process.cwd(), "storage", "quotations");
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  const fileName = `proposal-${data.quotation.quotationNumber}.pdf`;
  const filePath = path.join(storageDir, fileName);

  const primaryBlue = "#1e3a8a"; 
  const accentBlue = "#3b82f6";  
  const bgSoft = "#f8fafc";
  const borderGray = "#e2e8f0";
  const textDark = "#0f172a";
  const textGray = "#475569";

  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 40,
    bufferPages: true 
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // --- 1. PREMIUM HEADER ---
  doc.rect(0, 0, 595, 100).fill(primaryBlue);
  const logoPath = path.join(process.cwd(), "..", "frontend", "src", "assets", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 25, { width: 50 });
  }

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text("SOLEDIFY", 100, 30);
  doc.fontSize(9).font("Helvetica").text("RELIABLE. EFFICIENT. SUSTAINABLE.", 100, 58);
  doc.fontSize(14).font("Helvetica-Bold").text("SOLAR PV PROPOSAL", 40, 35, { align: "right" });
  doc.fontSize(8).font("Helvetica").text(`Ref: ${data.quotation.quotationNumber}`, 40, 55, { align: "right" });
  doc.text(`Date: ${data.quotation.createdAt.toLocaleDateString()}`, 40, 68, { align: "right" });

  doc.moveDown(5);

  // --- 2. PREPARED FOR ---
  let currentY = 120;
  doc.fillColor(primaryBlue).font("Helvetica-Bold").fontSize(10).text("PREPARED FOR:", 40, currentY);
  doc.fillColor(textDark).fontSize(14).text(data.customer.name.toUpperCase(), 40, currentY + 15);
  const customerAddress = [data.customer.location, data.customer.state].filter(Boolean).join(", ");
  doc.fillColor(textGray).font("Helvetica").fontSize(9).text(customerAddress, 40, currentY + 32);

  doc.moveTo(40, currentY + 55).lineTo(555, currentY + 55).strokeColor(borderGray).lineWidth(1).stroke();

  // --- 3. TECHNICAL SPECIFICATIONS ---
  currentY = 200;
  const cap = data.calculation?.plantCapacityKw || data.calculation?.systemCapacityKw || 0;
  const panels = data.calculation?.numberOfPanels || data.calculation?.panels || 0;
  const gen = data.calculation?.annualGenerationKwh || data.calculation?.annualGeneration || 0;

  doc.fillColor(primaryBlue).font("Helvetica-Bold").fontSize(14).text("TECHNICAL SPECIFICATIONS", 40, currentY);
  doc.fillColor(textGray).font("Helvetica").fontSize(9).text("High-performance components designed for maximum efficiency and longevity.", 40, currentY + 18);
  
  currentY += 45;

  const drawBullet = (x: number, y: number) => {
    doc.circle(x + 5, y + 4, 2).fill(accentBlue);
  };

  const drawSpecSection = (title: string, items: string[], description: string, x: number, y: number, width: number) => {
    doc.fillColor(primaryBlue).font("Helvetica-Bold").fontSize(10).text(title, x, y);
    doc.fillColor(textDark).font("Helvetica").fontSize(9);
    let itemY = y + 15;
    items.forEach(item => {
      drawBullet(x, itemY);
      doc.text(item, x + 15, itemY);
      itemY += 12;
    });
    doc.fillColor(textGray).fontSize(8).font("Helvetica-Oblique").text(description, x, itemY + 5, { width: width - 10 });
  };

  drawSpecSection("1. SYSTEM OVERVIEW", 
    [`Capacity: ${cap.toFixed(2)} kWp`, "Type: Grid-Tied (On-Grid)"], 
    "kWp represents the peak power output under standard test conditions.", 
    40, currentY, 250);

  drawSpecSection("2. SOLAR PANELS", 
    [`Quantity: ${panels} Nos.`, "Type: Mono-PERC", "Durability: IP68 Rated"], 
    "High-efficiency panels that capture more sunlight even in low-light conditions.", 
    305, currentY, 250);

  currentY += 75;
  drawSpecSection("3. INVERTER DETAILS", 
    [`Capacity: ${cap.toFixed(2)} kW`, "Pure Sine Wave", "App-Based Monitoring"], 
    "Converts DC to AC with 98% efficiency and tracks performance via your phone.", 
    40, currentY, 250);

  drawSpecSection("4. ENERGY GENERATION", 
    [`Estimated: ${Math.round(gen).toLocaleString()} kWh/yr`, "Monthly: ~304 Units"], 
    `This system can power approx. 4 ceiling fans, 1 fridge, and all LED lights daily.`, 
    305, currentY, 250);

  currentY += 85;
  drawSpecSection("5. MOUNTING STRUCTURE", 
    ["Galvanized Iron (HDGI)", "Wind Speed: 150 km/h", "Corrosion Resistant"], 
    "Engineered to withstand heavy winds and extreme weather for 25+ years.", 
    40, currentY, 250);

  drawSpecSection("6. ELECTRICAL & SAFETY", 
    ["DC/AC Distribution Boxes", "Lightning Arrester", "Dual Earthing System"], 
    "Complete protection against voltage surges and lightning strikes.", 
    305, currentY, 250);

  // --- 4. INVESTMENT SUMMARY (DETAILED TABLE) ---
  currentY = 480;
  doc.rect(40, currentY, 515, 200).fill(bgSoft);
  doc.rect(40, currentY, 515, 25).fill(primaryBlue);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("INVESTMENT SUMMARY & COST BREAKDOWN", 50, currentY + 8);

  const total = data.quotation.totalAmount;
  const gstRate = 0.138; // 13.8% assumed from your pricing config
  const subtotal = total / (1 + gstRate);
  const gstAmount = total - subtotal;

  // Breakdown percentages
  const breakdown = [
    { label: `Solar Panels (${panels} Nos.)`, amount: subtotal * 0.55 },
    { label: `Solar Inverter (${cap.toFixed(2)} kW)`, amount: subtotal * 0.15 },
    { label: "High-Strength Mounting Structure", amount: subtotal * 0.10 },
    { label: "Electricals, Wiring & Conduit", amount: subtotal * 0.07 },
    { label: "Installation & Commissioning", amount: subtotal * 0.06 },
    { label: "Protection System (ACDB/DCDB, Earthing)", amount: subtotal * 0.04 },
    { label: "Transport & Miscellaneous", amount: subtotal * 0.03 }
  ];

  let tableY = currentY + 35;
  doc.fontSize(9).fillColor(textDark);
  
  breakdown.forEach(item => {
    doc.font("Helvetica").text(item.label, 60, tableY);
    doc.font("Helvetica-Bold").text(`Rs. ${Math.round(item.amount).toLocaleString("en-IN")}`, 400, tableY, { align: "right", width: 140 });
    tableY += 18;
  });

  doc.moveTo(60, tableY).lineTo(540, tableY).strokeColor(borderGray).lineWidth(0.5).stroke();
  tableY += 8;

  doc.font("Helvetica-Bold").text("Subtotal (Value of Goods & Services)", 60, tableY);
  doc.text(`Rs. ${Math.round(subtotal).toLocaleString("en-IN")}`, 400, tableY, { align: "right", width: 140 });
  
  tableY += 18;
  doc.font("Helvetica").text(`GST (Goods & Services Tax @ 13.8%)`, 60, tableY);
  doc.text(`Rs. ${Math.round(gstAmount).toLocaleString("en-IN")}`, 400, tableY, { align: "right", width: 140 });

  tableY += 22;
  doc.rect(40, tableY - 5, 515, 25).fill(primaryBlue);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text("TOTAL PROJECT COST (Turnkey)", 60, tableY + 2);
  doc.text(`Rs. ${Math.round(total).toLocaleString("en-IN")}`, 400, tableY + 2, { align: "right", width: 140 });

  // --- 5. ROI & SAVINGS ---
  currentY = 705;
  doc.rect(40, currentY, 515, 60).strokeColor(primaryBlue).lineWidth(1).stroke();
  doc.fillColor(primaryBlue).font("Helvetica-Bold").fontSize(9).text("EXPECTED SAVINGS & ROI", 50, currentY + 10);
  
  const annSavings = data.financial?.annualSavings || (gen * 8);
  const net = data.quotation.netPayableAmount;
  doc.fillColor(textDark).font("Helvetica").fontSize(8).text(`Annual Savings: Rs. ${Math.round(annSavings).toLocaleString("en-IN")}`, 50, currentY + 25);
  doc.text(`Payback Period: ${data.financial?.paybackPeriodYears?.toFixed(1) || (net/annSavings).toFixed(1)} Years`, 50, currentY + 38);
  doc.fillColor("#059669").font("Helvetica-Bold").fontSize(10).text(`Net 25-Year Life Cycle Gain: Rs. ${Math.round(annSavings * 25).toLocaleString("en-IN")}`, 50, currentY + 50);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });

  return { filePath };
}
