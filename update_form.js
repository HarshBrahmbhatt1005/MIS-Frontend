const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/harsh/OneDrive/Desktop/MIS- Form/MIS-Intigration2-main/src/components/cust-login-form.jsx';

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Initial State
content = content.replace(
  /insurancePayout: "",\s*insurancePayoutInvoiceNumber: "",\s*insurancePayoutDate: "",\s*payoutReceived: "",\s*payoutReceivedInvoiceNumber: "",\s*payoutReceivedDate: "",\s*payoutPaid: "",\s*payoutPaidInvoiceNumber: "",\s*payoutPaidDate: "",\s*expensePaid: "",\s*expensePaidInvoiceNumber: "",\s*expensePaidDate: "",\s*gstReceived: "",\s*gstReceivedInvoiceNumber: "",\s*gstReceivedDate: "",\s*hsApprovalStatus/s,
  `invoiceGroupList: [{ 
      invoiceRaisedAmount: "", invoiceRaisedInvoiceNumber: "", invoiceRaisedDate: "",
      payoutReceivedAmount: "", payoutReceivedInvoiceNumber: "", payoutReceivedDate: "",
      gstReceivedAmount: "", gstReceivedInvoiceNumber: "", gstReceivedDate: "" 
    }],
    insurancePayoutStatus: "",
    insurancePayout: "",
    insurancePayoutInvoiceNumber: "",
    insurancePayoutDate: "",
    payoutPaidStatus: "",
    payoutPaid: "",
    payoutPaidInvoiceNumber: "",
    payoutPaidDate: "",
    payoutPaidVendorName: "",
    expensePaidStatus: "",
    expensePaid: "",
    expensePaidInvoiceNumber: "",
    expensePaidDate: "",
    expensePaidVendorName: "",
    hsApprovalStatus`
);

content = content.replace(
  /payoutReceivedList: \[\{ amount: "", invoiceNumber: "", date: "" \}\],\s*payoutPaidList: \[\{ amount: "", invoiceNumber: "", date: "" \}\],/g,
  ``
);

// 2. Disabled fields
content = content.replace(
  /const accountEditableFields = \["finalRemark", "consultingReceived", "consultingShared", "consultingRemark", "invoiceGeneratedBy", "invoiceGeneratedByOther", "payoutPercentage", "subventionShortPayment", "subventionRemark", "insurancePayout", "insurancePayoutInvoiceNumber", "insurancePayoutDate", "payoutReceivedList", "payoutPaidList", "expensePaid", "expensePaidInvoiceNumber", "expensePaidDate", "gstReceived", "gstReceivedInvoiceNumber", "gstReceivedDate"\];/g,
  `const accountEditableFields = ["finalRemark", "consultingReceived", "consultingShared", "consultingRemark", "invoiceGeneratedBy", "invoiceGeneratedByOther", "payoutPercentage", "subventionShortPayment", "subventionRemark", "invoiceGroupList", "insurancePayoutStatus", "insurancePayout", "insurancePayoutInvoiceNumber", "insurancePayoutDate", "payoutPaidStatus", "payoutPaid", "payoutPaidInvoiceNumber", "payoutPaidDate", "payoutPaidVendorName", "expensePaidStatus", "expensePaid", "expensePaidInvoiceNumber", "expensePaidDate", "expensePaidVendorName"];`
);

// 3. Payload parsing in handleSubmit account mode
content = content.replace(
  /insurancePayout: formData\.insurancePayout !== "" \? Number\(formData\.insurancePayout\) \|\| null : null,[\s\S]*?gstReceivedDate: formData\.gstReceivedDate \|\| "",/,
  `invoiceGroupList: (formData.invoiceGroupList || []).map(item => ({
             invoiceRaisedAmount: item.invoiceRaisedAmount !== "" && item.invoiceRaisedAmount !== null ? Number(item.invoiceRaisedAmount) : null,
             invoiceRaisedInvoiceNumber: item.invoiceRaisedInvoiceNumber || "",
             invoiceRaisedDate: item.invoiceRaisedDate || "",
             payoutReceivedAmount: item.payoutReceivedAmount !== "" && item.payoutReceivedAmount !== null ? Number(item.payoutReceivedAmount) : null,
             payoutReceivedInvoiceNumber: item.payoutReceivedInvoiceNumber || "",
             payoutReceivedDate: item.payoutReceivedDate || "",
             gstReceivedAmount: item.gstReceivedAmount !== "" && item.gstReceivedAmount !== null ? Number(item.gstReceivedAmount) : null,
             gstReceivedInvoiceNumber: item.gstReceivedInvoiceNumber || "",
             gstReceivedDate: item.gstReceivedDate || ""
           })),
           insurancePayoutStatus: formData.insurancePayoutStatus || "",
           insurancePayout: formData.insurancePayout !== "" ? Number(formData.insurancePayout) || null : null,
           insurancePayoutInvoiceNumber: formData.insurancePayoutInvoiceNumber || "",
           insurancePayoutDate: formData.insurancePayoutDate || "",
           payoutPaidStatus: formData.payoutPaidStatus || "",
           payoutPaid: formData.payoutPaid !== "" ? Number(formData.payoutPaid) || null : null,
           payoutPaidInvoiceNumber: formData.payoutPaidInvoiceNumber || "",
           payoutPaidDate: formData.payoutPaidDate || "",
           payoutPaidVendorName: formData.payoutPaidVendorName || "",
           expensePaidStatus: formData.expensePaidStatus || "",
           expensePaid: formData.expensePaid !== "" ? Number(formData.expensePaid) || null : null,
           expensePaidInvoiceNumber: formData.expensePaidInvoiceNumber || "",
           expensePaidDate: formData.expensePaidDate || "",
           expensePaidVendorName: formData.expensePaidVendorName || ""`
);

// 4. Payload parsing in normal mode (line 563)
content = content.replace(
  /insurancePayout: formData\.insurancePayout !== "" \? Number\(formData\.insurancePayout\) \|\| null : null,[\s\S]*?gstReceivedDate: formData\.gstReceivedDate \|\| "",/,
  `invoiceGroupList: (formData.invoiceGroupList || []).map(item => ({
         invoiceRaisedAmount: item.invoiceRaisedAmount !== "" && item.invoiceRaisedAmount !== null ? Number(item.invoiceRaisedAmount) : null,
         invoiceRaisedInvoiceNumber: item.invoiceRaisedInvoiceNumber || "",
         invoiceRaisedDate: item.invoiceRaisedDate || "",
         payoutReceivedAmount: item.payoutReceivedAmount !== "" && item.payoutReceivedAmount !== null ? Number(item.payoutReceivedAmount) : null,
         payoutReceivedInvoiceNumber: item.payoutReceivedInvoiceNumber || "",
         payoutReceivedDate: item.payoutReceivedDate || "",
         gstReceivedAmount: item.gstReceivedAmount !== "" && item.gstReceivedAmount !== null ? Number(item.gstReceivedAmount) : null,
         gstReceivedInvoiceNumber: item.gstReceivedInvoiceNumber || "",
         gstReceivedDate: item.gstReceivedDate || ""
       })),
       insurancePayoutStatus: formData.insurancePayoutStatus || "",
       insurancePayout: formData.insurancePayout !== "" ? Number(formData.insurancePayout) || null : null,
       insurancePayoutInvoiceNumber: formData.insurancePayoutInvoiceNumber || "",
       insurancePayoutDate: formData.insurancePayoutDate || "",
       payoutPaidStatus: formData.payoutPaidStatus || "",
       payoutPaid: formData.payoutPaid !== "" ? Number(formData.payoutPaid) || null : null,
       payoutPaidInvoiceNumber: formData.payoutPaidInvoiceNumber || "",
       payoutPaidDate: formData.payoutPaidDate || "",
       payoutPaidVendorName: formData.payoutPaidVendorName || "",
       expensePaidStatus: formData.expensePaidStatus || "",
       expensePaid: formData.expensePaid !== "" ? Number(formData.expensePaid) || null : null,
       expensePaidInvoiceNumber: formData.expensePaidInvoiceNumber || "",
       expensePaidDate: formData.expensePaidDate || "",
       expensePaidVendorName: formData.expensePaidVendorName || ""`
);

{/* Financial Tracking */}
<div style={{ marginTop: "16px", borderTop: "2px solid #0369a1", paddingTop: "12px" }}>
  <label style={{ color: "#0369a1", fontWeight: "bold", fontSize: "15px", display: "block", marginBottom: "12px" }}>
    🔒 Financial Tracking
  </label>

  {/* Invoice Groups */}
  {(formData.invoiceGroupList || []).map((grp, index) => (
    <div key={index} style={{ marginBottom: "16px", padding: "12px", background: "#f0f9ff", borderRadius: "6px", border: "1px solid #bae6fd" }}>
      
      {/* Invoice Raised */}
      <label style={{ fontWeight: "bold" }}>Invoice Raised</label>
      <input
        type="number"
        placeholder="Amount"
        value={grp.invoiceRaisedAmount || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].invoiceRaisedAmount = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="text"
        placeholder="Invoice #"
        value={grp.invoiceRaisedInvoiceNumber || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].invoiceRaisedInvoiceNumber = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="date"
        value={grp.invoiceRaisedDate || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].invoiceRaisedDate = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      {/* Payout Received */}
      <label style={{ fontWeight: "bold", marginTop: "10px", display: "block" }}>Payout Received</label>

      <input
        type="number"
        placeholder="Amount"
        value={grp.payoutReceivedAmount || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].payoutReceivedAmount = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="text"
        placeholder="Invoice #"
        value={grp.payoutReceivedInvoiceNumber || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].payoutReceivedInvoiceNumber = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="date"
        value={grp.payoutReceivedDate || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].payoutReceivedDate = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      {/* GST */}
      <label style={{ fontWeight: "bold", marginTop: "10px", display: "block" }}>GST Received</label>

      <input
        type="number"
        placeholder="Amount"
        value={grp.gstReceivedAmount || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].gstReceivedAmount = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="text"
        placeholder="Invoice #"
        value={grp.gstReceivedInvoiceNumber || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].gstReceivedInvoiceNumber = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />

      <input
        type="date"
        value={grp.gstReceivedDate || ""}
        onChange={(e) => {
          const updated = [...formData.invoiceGroupList];
          updated[index].gstReceivedDate = e.target.value;
          setFormData(prev => ({ ...prev, invoiceGroupList: updated }));
        }}
      />
    </div>
  ))}

  {/* Add Group Button */}
  <button
    type="button"
    onClick={() => {
      setFormData(prev => ({
        ...prev,
        invoiceGroupList: [
          ...prev.invoiceGroupList,
          {
            invoiceRaisedAmount: "",
            invoiceRaisedInvoiceNumber: "",
            invoiceRaisedDate: "",
            payoutReceivedAmount: "",
            payoutReceivedInvoiceNumber: "",
            payoutReceivedDate: "",
            gstReceivedAmount: "",
            gstReceivedInvoiceNumber: "",
            gstReceivedDate: ""
          }
        ]
      }));
    }}
  >
    ➕ Add Group
  </button>

  {/* Payout Paid */}
  <h4>Payout Paid</h4>
  <input type="radio" name="payoutPaidStatus" value="Yes" onChange={handleChange} /> Yes
  <input type="radio" name="payoutPaidStatus" value="No" onChange={handleChange} /> No

  {formData.payoutPaidStatus === "Yes" && (
    <>
      <input type="number" name="payoutPaid" placeholder="Amount" onChange={handleChange} />
      <input type="text" name="payoutPaidInvoiceNumber" placeholder="Invoice #" onChange={handleChange} />
      <input type="date" name="payoutPaidDate" onChange={handleChange} />
      <input type="text" name="payoutPaidVendorName" placeholder="Vendor Name" onChange={handleChange} />
    </>
  )}

  {/* Expense Paid */}
  <h4>Expense Paid</h4>
  <input type="radio" name="expensePaidStatus" value="Yes" onChange={handleChange} /> Yes
  <input type="radio" name="expensePaidStatus" value="No" onChange={handleChange} /> No

  {formData.expensePaidStatus === "Yes" && (
    <>
      <input type="number" name="expensePaid" placeholder="Amount" onChange={handleChange} />
      <input type="text" name="expensePaidInvoiceNumber" placeholder="Invoice #" onChange={handleChange} />
      <input type="date" name="expensePaidDate" onChange={handleChange} />
      <input type="text" name="expensePaidVendorName" placeholder="Vendor Name" onChange={handleChange} />
    </>
  )}

  {/* Insurance */}
  <h4>Insurance Payout</h4>
  <input type="radio" name="insurancePayoutStatus" value="Yes" onChange={handleChange} /> Yes
  <input type="radio" name="insurancePayoutStatus" value="No" onChange={handleChange} /> No

  {formData.insurancePayoutStatus === "Yes" && (
    <>
      <input type="number" name="insurancePayout" placeholder="Amount" onChange={handleChange} />
      <input type="text" name="insurancePayoutInvoiceNumber" placeholder="Invoice #" onChange={handleChange} />
      <input type="date" name="insurancePayoutDate" onChange={handleChange} />
    </>
  )}
</div>