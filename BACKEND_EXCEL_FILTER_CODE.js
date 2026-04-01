// ============================================
// BACKEND CODE: Excel Export with Level 2 Filter
// ============================================
// File: routes/builderVisits.js (or your routes file)
// 
// Replace your existing Excel export route with this code
// ============================================

const ExcelJS = require('exceljs'); // Make sure to install: npm install exceljs

router.get("/export/excel", async (req, res) => {
  const { password } = req.query;
  
  // Validate password
  if (!password || password !== process.env.EXCEL_EXPORT_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  
  try {
    // ✅ CRITICAL: Only get Level 2 approved visits
    const visits = await BuilderVisit.find({
      "approval.level2.status": "Approved"
    }).sort({ "approval.level2.at": -1 }); // Sort by approval date, newest first
    
    // Check if any approved visits exist
    if (visits.length === 0) {
      return res.status(404).json({ 
        error: "No Level 2 approved properties found for export" 
      });
    }
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Level 2 Approved Properties");
    
    // Define columns
    worksheet.columns = [
      { header: "Project Name", key: "projectName", width: 25 },
      { header: "Builder Name", key: "builderName", width: 25 },
      { header: "Group Name", key: "groupName", width: 25 },
      { header: "Location", key: "location", width: 35 },
      { header: "Development Type", key: "developmentType", width: 25 },
      { header: "Contact Person", key: "officePersonDetails", width: 30 },
      { header: "Contact Number", key: "officePersonNumber", width: 15 },
      { header: "Executives", key: "executives", width: 40 },
      { header: "Gentry", key: "gentry", width: 20 },
      { header: "Total Units & Blocks", key: "totalUnitsBlocks", width: 20 },
      { header: "Total Blocks", key: "totalBlocks", width: 15 },
      { header: "Stage of Construction", key: "stageOfConstruction", width: 25 },
      { header: "Completion Date", key: "expectedCompletionDate", width: 18 },
      { header: "Project Loan Awail", key: "financingRequirements", width: 18 },
      { header: "Nearby Projects", key: "nearbyProjects", width: 35 },
      { header: "Enquiry Type", key: "enquiryType", width: 18 },
      { header: "Units for Sale", key: "unitsForSale", width: 15 },
      { header: "Remark", key: "remark", width: 35 },
      { header: "Payout", key: "payout", width: 25 },
      { header: "Sai-Fakira Manager", key: "saiFakiraManager", width: 25 },
      { header: "Form Submitted At", key: "submittedAt", width: 25 },
      { header: "Level 1 Status", key: "level1Status", width: 15 },
      { header: "Level 1 Approved By", key: "level1By", width: 20 },
      { header: "Level 1 Approved At", key: "level1At", width: 20 },
      { header: "Level 2 Status", key: "level2Status", width: 15 },
      { header: "Level 2 Approved By", key: "level2By", width: 20 },
      { header: "Level 2 Approved At", key: "level2At", width: 20 },
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Add data rows
    visits.forEach((visit) => {
      worksheet.addRow({
        projectName: visit.projectName || "",
        builderName: visit.builderName || "",
        groupName: visit.groupName || "",
        location: visit.location || "",
        developmentType: visit.developmentType || "",
        officePersonDetails: visit.officePersonDetails || "",
        officePersonNumber: visit.officePersonNumber || "",
        executives: visit.executives && visit.executives.length > 0
          ? visit.executives.map(exec => `${exec.name} - ${exec.number}`).join('; ')
          : "",
        gentry: visit.gentry || "",
        totalUnitsBlocks: visit.totalUnitsBlocks || "",
        totalBlocks: visit.totalBlocks || "",
        stageOfConstruction: visit.stageOfConstruction || "",
        expectedCompletionDate: visit.expectedCompletionDate || "",
        financingRequirements: visit.financingRequirements || "",
        nearbyProjects: visit.nearbyProjects || "",
        enquiryType: visit.enquiryType || "",
        unitsForSale: visit.unitsForSale || "",
        remark: visit.remark || "",
        payout: visit.payout || "",
        saiFakiraManager: visit.saiFakiraManager || "",
        submittedAt: visit.submittedAt 
          ? new Date(visit.submittedAt).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) 
          : "",
        level1Status: visit.approval?.level1?.status || "Pending",
        level1By: visit.approval?.level1?.by || "",
        level1At: visit.approval?.level1?.at 
          ? new Date(visit.approval.level1.at).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) 
          : "",
        level2Status: visit.approval?.level2?.status || "Pending",
        level2By: visit.approval?.level2?.by || "",
        level2At: visit.approval?.level2?.at 
          ? new Date(visit.approval.level2.at).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) 
          : "",
      });
      
      // Add property details as sub-rows
      if (visit.propertySizes && visit.propertySizes.length > 0) {
        visit.propertySizes.forEach((prop, index) => {
          const propertyRow = worksheet.addRow({
            projectName: `    └─ Property ${index + 1}`,
            builderName: `Type: ${prop.type || ""}`,
            groupName: `${prop.size ? `Size: ${prop.size}` : prop.floor ? `Floor: ${prop.floor}` : ""}`,
            location: `Category: ${prop.category || "N/A"}`,
            developmentType: `SQ.FT: ${prop.sqft || ""}`,
            officePersonDetails: `SQ.YD: ${prop.sqyd || ""}`,
            officePersonNumber: `Box Price: ${prop.boxPrice || ""}`,
            gentry: `PLC: ${prop.plc || ""}`,
            totalUnitsBlocks: `FRC: ${prop.frc || ""}`,
            stageOfConstruction: `Maintenance: ${prop.maintenance || ""}`,
            expectedCompletionDate: `Maint. Deposit: ${prop.maintenanceDeposit || ""}`,
            financingRequirements: `SaleDeed: ${prop.selldedAmount || ""}`,
            nearbyProjects: `AEC/AUDA: ${prop.aecAuda || ""}`,
          });
          
          // Style property rows (indent and lighter color)
          propertyRow.font = { italic: true, color: { argb: 'FF666666' } };
          propertyRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' }
          };
        });
      }
    });
    
    // Auto-fit columns (optional)
    worksheet.columns.forEach(column => {
      if (column.width < 15) column.width = 15;
    });
    
    // Generate filename with date
    const filename = `Builder_Visits_Level2_Approved_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error("❌ Excel export error:", error);
    res.status(500).json({ 
      error: "Failed to generate Excel file",
      details: error.message 
    });
  }
});

// ============================================
// ALTERNATIVE: If you want a separate endpoint for all visits
// ============================================

router.get("/export/excel/all", async (req, res) => {
  const { password } = req.query;
  
  if (!password || password !== process.env.EXCEL_EXPORT_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  
  try {
    // Get ALL visits (no filter)
    const visits = await BuilderVisit.find({}).sort({ createdAt: -1 });
    
    // Same Excel generation logic as above...
    // (Copy the workbook creation code from above)
    
  } catch (error) {
    console.error("❌ Excel export error:", error);
    res.status(500).json({ error: "Failed to generate Excel file" });
  }
});

// ============================================
// PACKAGE.JSON DEPENDENCY
// ============================================
// Make sure you have ExcelJS installed:
// npm install exceljs
//
// Or add to package.json:
// "dependencies": {
//   "exceljs": "^4.3.0"
// }
