# PDF Download Functionality - Implementation Guide

This document lists all code changes needed to add PDF download functionality to the old codebase.

---

## 1. NEW FILE: `src/services/applicationPdfService.js`

**Create this new file completely.** This is the PDF generation service.

```javascript
import { jsPDF } from "jspdf";

const EMPTY_VALUE = "-";const MM_TO_PT = 72 / 25.4;
const mm = (value) => value * MM_TO_PT;

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-GB");
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "" || value === "•") return EMPTY_VALUE;
  const numericValue = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numericValue)) return String(value);
  return numericValue.toLocaleString("en-IN");
};

const formatText = (value) => {
  if (value === null || value === undefined || value === "" || value === "•") return EMPTY_VALUE;
  if (Array.isArray(value)) return value.length ? value.join(", ") : EMPTY_VALUE;
  return String(value);
};

const resolveOptionValue = (value, otherValue) => {
  if (!value || value === "•") return otherValue || EMPTY_VALUE;
  return value === "Other" ? otherValue || EMPTY_VALUE : value;
};

const computeDynamicRowHeight = (doc, row, colWidths, standardRowHeight) => {
  let maxLines = 1;
  row.forEach((cell, colIdx) => {
    if (cell && String(cell).trim().length > 0) {
      doc.setFontSize(colIdx === 0 || colIdx === 2 ? 8 : 8.5);
      const lines = doc.splitTextToSize(String(cell), colWidths[colIdx] - 8);
      maxLines = Math.max(maxLines, lines.length);
    }
  });
  return Math.max(standardRowHeight, maxLines * 12 + 16);
};

const drawSectionTable = (doc, title, rows, y, options = {}) => {
  const marginX = mm(10);
  const tableWidth = mm(190); 
  const colWidths = [mm(47.5), mm(47.5), mm(47.5), mm(47.5)];
  const headerHeight = 20;
  const standardRowHeight = 20;
  const largeRowHeight = 60;
  const largeRows = options.largeRows || [];
  const dynamicRows = options.dynamicRows || [];

  // Precompute row heights
  const rowHeights = rows.map((row, i) => {
    if (dynamicRows.includes(i)) return computeDynamicRowHeight(doc, row, colWidths, standardRowHeight);
    return largeRows.includes(i) ? largeRowHeight : standardRowHeight;
  });

  const sectionTotalHeight = headerHeight + rowHeights.reduce((a, b) => a + b, 0);

  if (y + sectionTotalHeight > doc.internal.pageSize.getHeight() - mm(15)) {
    doc.addPage();
    y = mm(15);
  }

  doc.setFillColor(211, 211, 211);
  doc.rect(marginX, y, tableWidth, headerHeight, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(title, marginX + tableWidth / 2, y + 13, { align: "center" });

  let currentY = y + headerHeight;

  rows.forEach((row, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.rect(marginX, currentY, colWidths[0], rowHeight);
    doc.text(String(row[0] || ""), marginX + 5, currentY + 12, { maxWidth: colWidths[0] - 8 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.rect(marginX + colWidths[0], currentY, colWidths[1], rowHeight);
    doc.text(String(row[1] || ""), marginX + colWidths[0] + 5, currentY + 12, { maxWidth: colWidths[1] - 8 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.rect(marginX + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight);
    doc.text(String(row[2] || ""), marginX + colWidths[0] + colWidths[1] + 5, currentY + 12, { maxWidth: colWidths[2] - 8 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.rect(marginX + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], rowHeight);
    doc.text(String(row[3] || ""), marginX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 12, { maxWidth: colWidths[3] - 8 });

    currentY += rowHeight;
  });

  return currentY + 12;
};

export const generateApplicationPdf = (application) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = mm(15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Loan Case Processing Form", pageWidth / 2, y, { align: "center" });
  y += 25;

  const sectionsList = [];
  sectionsList.push({
    title: "CASE INFORMATION",
    rows: [
      ["Case Code", formatText(application.code), "Status", formatText(application.status)],
      ["Approval Status", formatText(application.approvalStatus), "Login Date", formatDate(application.loginDate)],
      ["Re-login Reason", formatText(application.reloginReason), "Sales Person", formatText(application.sales)],
      ["Reference", formatText(application.ref), "Source Channel", formatText(resolveOptionValue(application.sourceChannel, application.otherSourceChannel))],
    ],
    largeRows: [],
  });
  sectionsList.push({
    title: "CLIENT DETAILS",
    rows: [
      ["Client Name", formatText(application.name), "Mobile", formatText(application.mobile)],
      ["Email", formatText(application.email), "Category", formatText(resolveOptionValue(application.category, application.otherCategory))],
    ],
    largeRows: [],
  });
  sectionsList.push({
    title: "BANK PROCESSING",
    rows: [
      ["Bank Name", formatText(resolveOptionValue(application.bank, application.otherBank)), "Banker Name", formatText(application.bankerName)],
      ["Loan Number", formatText(application.loanNumber), "", ""],
    ],
    largeRows: [],
  });
  
  // PD / INTERNAL CHECK - variable height based on remarks text content
  sectionsList.push({
    title: "PD / INTERNAL CHECK",
    rows: [["Audit Data", formatText(application.auditData), "Remarks", formatText(application.remark)]],
    dynamicRows: [0],
  });

  const disbursementRows = [
    ["Sanction Amount", formatAmount(application.sanctionAmount), "", ""],
  ];
  if (application.status !== "Part Disbursed" && (application.disbursedDate || application.disbursedAmount)) {
    disbursementRows.push(["Disbursed Date", formatDate(application.disbursedDate), "Disbursed Amount", formatAmount(application.disbursedAmount)]);
  }
  if (Array.isArray(application.partDisbursed)) {
    application.partDisbursed.forEach((part, index) => {
      if (part && (part.date || part.amount)) {
        disbursementRows.push([`Part Disbursement ${index + 1} Date`, formatDate(part.date), "Amount", formatAmount(part.amount)]);
      }
    });
  }
  sectionsList.push({ title: "DISBURSEMENT DETAILS", rows: disbursementRows, largeRows: [] });

  const insuranceAmountDisplay =
    application.insuranceOption && application.insuranceOption.toLowerCase() === "yes"
      ? formatAmount(application.insuranceAmount)
      : "Bank";
  sectionsList.push({
    title: "INSURANCE / SUBVENTION",
    rows: [
      ["Insurance Amount", insuranceAmountDisplay, "Subvention Amount", formatAmount(application.subventionAmount)],
    ],
    largeRows: [],
  });
  sectionsList.push({
    title: "FINANCIAL / PAYOUT DETAILS",
    rows: [
      ["Payout (Yes/No)", formatText(application.payout), "Expense Paid By", formatAmount(application.expenceAmount)],
      ["Fees Refund", formatAmount(application.feesRefundAmount), "", ""],
    ],
    largeRows: [],
  });
  
  sectionsList.push({
    title: "CONSULTING",
    rows: [["Consulting Notes", formatText(application.consulting), "", ""]],
    dynamicRows: [0],
  });
  sectionsList.forEach((section) => {
    y = drawSectionTable(doc, section.title, section.rows, y, { largeRows: section.largeRows, dynamicRows: section.dynamicRows });
  });

  const safeName = (application.name || "application").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`${safeName}-loan-case-form.pdf`);
};

export default generateApplicationPdf;
```

---

## 2. CHANGES IN: `src/components/cust-login-form.jsx`

### 2A. Add Import at the Top

Add this import after existing imports (around line 5):

```javascript
import generateApplicationPdf from "../services/applicationPdfService";
```

### 2B. Add State for PDF Loading

Add this state variable in the component (around line 92, with other useState declarations):

```javascript
const [pdfLoadingId, setPdfLoadingId] = useState(null);
```

### 2C. Add PDF Download Handler

Add this function (around line 536, with other handlers like `handleExcelDownload`):

```javascript
const handlePdfDownload = async (id) => {
  try {
    setPdfLoadingId(id);
    const response = await axios.get(`${API}/api/applications/${id}`);
    generateApplicationPdf(response.data);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Unable to generate PDF. Please try again after the application data loads.");
  } finally {
    setPdfLoadingId(null);
  }
};
```

### 2D. Update the Download PDF Button in Card

Find the card actions section (around line 1841) and replace the download button with:

```javascript
<div className="card-actions">
  {(app.status === "Disbursed" || app.status === "Part Disbursed") && (
    <button
      className="pdf-btn"
      onClick={() => handlePdfDownload(app._id)}
      disabled={pdfLoadingId === app._id}
    >
      {pdfLoadingId === app._id ? "Generating PDF..." : "📄 Download PDF"}
    </button>
  )}

  {app.approvalStatus !== "Rejected by SB" && (
    <button className="edit-btn" onClick={() => handleEdit(app)}>
      ✏️ Edit
    </button>
  )}
</div>
```

---

## 3. DEPENDENCIES: Ensure `package.json` Includes

Check your `package.json` has these dependencies (should already be there):

```json
{
  "dependencies": {
    "jspdf": "^4.2.0",
    "axios": "^1.12.2",
    ...
  }
}
```

If `jspdf` is missing, run:
```bash
npm install jspdf
```

---

## 4. BACKEND ENDPOINT REQUIREMENT

The frontend calls: `GET /api/applications/:id`

Ensure your backend has this endpoint that returns a single application object with all required fields:
- `code`, `name`, `mobile`, `email`, `status`, `loginDate`, `approvalStatus`
- `sanctionAmount`, `disbursedDate`, `disbursedAmount`
- `insuranceOption`, `insuranceAmount`, `subventionOption`, `subventionAmount`
- `remark` (the remarks field), `auditData`, `consulting`
- `payout`, `expenceAmount`, `feesRefundAmount`
- `reloginReason`, `sales`, `ref`, `sourceChannel`, `otherSourceChannel`
- `category`, `otherCategory`, `bank`, `otherBank`, `bankerName`, `loanNumber`
- `partDisbursed` (array for part disbursements)

---

## Summary of Changes

| File | Change Type | Details |
|------|------------|---------|
| `src/services/applicationPdfService.js` | **NEW FILE** | Complete PDF generation service (293 lines) |
| `src/components/cust-login-form.jsx` | Import | Add generateApplicationPdf import |
| `src/components/cust-login-form.jsx` | State | Add pdfLoadingId state |
| `src/components/cust-login-form.jsx` | Handler | Add handlePdfDownload function |
| `src/components/cust-login-form.jsx` | UI | Update card download button with status check |
| `package.json` | Dependency | Ensure jsPDF is installed |

---

## Key Features Implemented

✅ Variable-height PDF rows (Remarks and Consulting Notes auto-adjust based on content)
✅ PDF only shows for "Disbursed" or "Part Disbursed" status
✅ No "Loan Requirement" section in PDF
✅ No "Sanction Details" or "Approvals" sections
✅ "Sanction Amount" moved to Disbursement Details
✅ Insurance/Subvention section simplified (no Yes/No fields)
✅ Disbursed Date/Amount only shown for non-Part-Disbursed cases
✅ Part Disbursement rows shown separately
✅ Dynamic PDF file naming based on customer name
