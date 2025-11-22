import React, { useEffect, useState } from "react";
import "../css/custForm.css";
import { FaCloudDownloadAlt } from "react-icons/fa";
import axios from "axios";

const CustForm = () => {
  const API = import.meta.env.VITE_API_URL;
  const initialFormData = {
    code: "",
    otherCode: "",
    name: "",
    mobile: "",
    email: "",
    product: "",
    otherProduct: "",
    amount: "",
    bank: "",
    otherBank: "",
    bankerName: "",
    status: "",
    loginDate: "",
    sanctionDate: "",
    sanctionAmount: "",
    disbursedDate: "",
    loanNumber: "",
    disbursedAmount: "",
    insuranceOption: "",
    insuranceAmount: "",
    sales: "",
    ref: "",
    sourceChannel: "",
    otherSourceChannel: "",
    remark: "",
    approvalStatus: "",
    payout: "",
    expenceAmount: "",
    feesRefundAmount: "",
    propertyType: "",
    otherPropertyType: "",
    propertyDetails: "",
    mktValue: "",
    roi: "",
    processingFees: "",
    category: "",
    otherCategory: "",
    auditData: "",
    consulting: "",
  };

  const safeFormatDate = (value) => {
    if (!value) return "";

    // yyyy-mm or yyyy-mm-dd both allowed
    if (value.length === 7) {
      const [year, month] = value.split("-");
      return `${month}-${year}`; // MM-YYYY
    }

    const d = new Date(value);
    if (isNaN(d)) return value; // show raw value if not parseable

    return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const [isApprovedLock, setIsApprovedLock] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [applications, setApplications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    sales: "",
    status: "",
  });
  const [refFilter, setRefFilter] = useState("");
  const [importantChangeMsg, setImportantChangeMsg] = useState("");
  const [resetApproval, setResetApproval] = useState(false);
  const [showSanctionFields, setShowSanctionFields] = useState(false);

  const importantFields = [
    "remark",
    "feesRefundAmount",
    "expenceAmount",
    "consulting",
    "ProcessingFees",
    "payout",
    "status",
  ];

  // Utility to format date (ISO → DD-MM-YYYY)
  const formatDateToIndian = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  // Utility to reverse (DD-MM-YYYY → YYYY-MM-DD) for input fields
  const parseIndianDate = (str) => {
    if (!str) return "";
    const [day, month, year] = str.split("-");
    return `${year}-${month}-${day}`;
  };
  const formatIndianNumber = (numStr) => {
    if (!numStr) return "";
    const clean = numStr.toString().replace(/,/g, "");
    if (isNaN(clean) || clean === "") return "";
    return Number(clean).toLocaleString("en-IN");
  };

  const isFieldDisabled = (fieldName) => {
    // ✅ only run locking logic if record is actually approved
    if (isApprovedLock) {
      // these fields will still be editable even when approved
      const alwaysEditable = [
        "remark",
        "feesRefundAmount",
        "expenceAmount",
        "consulting",
        "ProcessingFees",
        "payout",
        "status",
        "sanctionDate",
        "sanctionAmount",
        "disbursedDate",
        "loanNumber",
        "disbursedAmount",
        "insuranceOption",
        "insuranceAmount",
        "partDisbursed",
      ];
      return !alwaysEditable.includes(fieldName); // all others disabled
    }
    return false; // if not approved, everything editable
  };

  // =================== Helpers ===================
  const getFieldValue = (field, otherField) => {
    if (!field) return "";
    return field === "Other" ? otherField || "" : field;
  };

  const maskMobile = (mobile) => {
    if (!mobile) return "";
    const mobileStr = String(mobile);
    return mobileStr.length >= 4 ? "XXXXXX" + mobileStr.slice(-4) : mobileStr;
  };

  const finalFormData = () => ({
    ...formData,
    code: getFieldValue(formData.code, formData.otherCode),
    product: getFieldValue(formData.product, formData.otherProduct),
    sourceChannel: getFieldValue(
      formData.sourceChannel,
      formData.otherSourceChannel
    ),
    bank: getFieldValue(formData.bank, formData.otherBank),
    approvalStatus: resetApproval ? "" : formData.approvalStatus,
  });

  // =================== Fetch ===================
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API}/api/applications`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApplications([]);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const appDate = new Date(app.loginDate);
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    if (from && appDate < from) return false;
    if (to && appDate > to) return false;
    if (filters.sales && app.sales !== filters.sales) return false;
    if (filters.status && app.status !== filters.status) return false;

    return true;
  });

  // =================== Handlers ===================
  const handleChange = (e, index, field) => {
    const { name, value } = e.target;

    // ✅ Allow these fields even if approved
    const alwaysEditable = [
      "remark",
      "feesRefundAmount",
      "payout",
      "expenceAmount",
      "status",
      "sanctionDate",
      "sanctionAmount",
      "disbursedDate",
      "loanNumber",
      "disbursedAmount",
      "insuranceOption",
      "insuranceAmount",
      "partDisbursed", // ✅ important
    ];

    if (isApprovedLock && !alwaysEditable.includes(name)) return;

    // ✅ Amount fields that need Indian comma formatting
    const amountFields = [
      "amount",
      "sanctionAmount",
      "disbursedAmount",
      "insuranceAmount",
    ];

    // ✅ Handle amount fields
    if (amountFields.includes(name)) {
      let cleaned = value.replace(/,/g, ""); // remove commas
      if (!isNaN(cleaned) && cleaned !== "") {
        const formatted = Number(cleaned).toLocaleString("en-IN");
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      } else if (cleaned === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
      }
      return;
    }

    // ✅ Special logic for Part Disbursed inputs (date/amount)
    if (name === "partDisbursed") {
      setFormData((prev) => {
        const updated = [...(prev.partDisbursed || [])];
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
        return { ...prev, partDisbursed: updated };
      });
      return;
    }

    // ✅ Mobile field (only digits, max 10)
    if (name === "mobile") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10)
        setFormData((prev) => ({ ...prev, [name]: onlyNums }));
      return;
    }

    // ✅ Default case (simple fields)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add new Part Disbursed row
  const handleAddPartDisbursed = () => {
    setFormData((prev) => ({
      ...prev,
      partDisbursed: [
        ...(prev.partDisbursed || []),
        { date: "", amount: "" }, // use consistent key names
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobile && formData.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    let resetApprovalLocal = false;
    let changedFields = [];
    let importantMsg = "";

    if (editingId) {
      const originalApp = applications.find((app) => app._id === editingId);

      if (originalApp) {
        importantFields.forEach((field) => {
          const newVal = (formData[field] || "").trim();
          const oldVal = (originalApp[field] || "").trim();
          if (newVal !== oldVal) {
            resetApprovalLocal = true;
            changedFields.push(field);
          }
        });

        if (resetApprovalLocal) {
          importantMsg = `⚠️ Important field changed (${changedFields.join(
            ", "
          )}), re-approval required.`;
        }
      }
    }

    const finalData = {
      ...formData,
      product:
        formData.product === "Other" && formData.otherProduct
          ? formData.otherProduct
          : formData.product,
      code:
        formData.code === "Other" && formData.otherCode
          ? formData.otherCode
          : formData.code,
      bank:
        formData.bank === "Other" && formData.otherBank
          ? formData.otherBank
          : formData.bank,
      sourceChannel:
        formData.sourceChannel === "Other" && formData.otherSourceChannel
          ? formData.otherSourceChannel
          : formData.sourceChannel,
      category:
        formData.category === "Other" && formData.otherCategory
          ? formData.otherCategory
          : formData.category,
      loginDate: parseIndianDate(formData.loginDate),
      sanctionDate: parseIndianDate(formData.sanctionDate),
      disbursedDate: parseIndianDate(formData.disbursedDate),
    };

    try {
      if (editingId) {
        await axios.patch(`${API}/api/applications/${editingId}`, {
          ...finalData,
          approvalStatus: resetApprovalLocal
            ? "Pending"
            : formData.approvalStatus,
          importantMsg,
        });
        alert("✅ Application updated!");
      } else {
        await axios.post(`${API}/api/applications`, finalData);
        alert("✅ Application saved!");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setIsApprovedLock(false);
      fetchApplications();
    } catch (err) {
      console.error("❌ Error saving application:", err);
      alert("Failed to save form.");
    }
  };

  const handleEdit = async (app) => {
    const salesName = app.sales || "";
    const password = prompt(`Enter password for ${salesName}:`);
    if (!password) return;

    try {
      const res = await axios.post(`${API}/api/verify-edit`, {
        sales: salesName,
        password,
      });

      if (res.data?.ok) {
        setEditingId(app._id);

        // const formattedLoginDate = app.loginDate
        //   ? formatDateToIndian(app.loginDate)
        //   : "";
        // const formattedDisbursedDate = app.disbursedDate
        //   ? formatDateToIndian(app.disbursedDate)
        //   : "";
        // Convert date to YYYY-MM-DD (input friendly)
        const formatDateForInput = (dateStr) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d)) return "";
          return d.toISOString().split("T")[0]; // ✅ 'YYYY-MM-DD'
        };

        const formattedLoginDate = formatDateForInput(app.loginDate);
        const formattedDisbursedDate = formatDateForInput(app.disbursedDate);
        const formattedSanctionDate = formatDateForInput(app.sanctionDate);

        // ✅ Check approval lock
        const approved = app.approvalStatus === "Approved by SB";
        setIsApprovedLock(approved);

        // ✅ Always initialize partDisbursed properly
        setFormData({
          ...app,
          loginDate: formattedLoginDate,
          disbursedDate: formattedDisbursedDate,
          propertyType: app.propertyType || "",
          status: app.status || "",
          partDisbursed: Array.isArray(app.partDisbursed)
            ? app.partDisbursed
            : [], // ✅ Fix: ensures array always exists
        });

        setImportantChangeMsg("");
        setResetApproval(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Verification failed. Try again or contact admin.");
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        alert("❌ Invalid password. You are not allowed to edit this record.");
      } else if (status === 404) {
        alert(
          `⚠️ No password configured for ${salesName}. Contact admin to set a password.`
        );
      } else {
        console.error("verify-edit error:", err);
        alert("Server error while verifying. Please try again later.");
      }
    }
  };

  const handleApprove = async (id) => {
    const password = prompt("Enter approval password:");
    if (!password) return;

    try {
      await axios.patch(`${API}/api/applications/${id}/approve`, { password });
      // clear important message after approval
      await axios.patch(`${API}/api/applications/${id}`, { importantMsg: "" });
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Approval failed. Wrong password or server error.");
    }
  };

  const handleReject = async (id) => {
    const password = prompt("Enter approval password:");
    if (!password) return;

    try {
      await axios.patch(`${API}/api/applications/${id}/reject`, { password });
      alert("❌ Rejected successfully!");
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Rejection failed. Wrong password or server error.");
    }
  };

  // =================== Excel Downloads ===================
  const handleExcelDownload = async () => {
    const password = prompt("Enter download password:");
    if (!password) return;

    try {
      const response = await axios.get(`${API}/api/export/excel`, {
        params: { password },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applications_All.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleExportRef = async () => {
    if (!refFilter) {
      alert("Select a Sales to download Excel.");
      return;
    }
    const password = prompt(`Enter password for ${refFilter}:`);
    if (!password) return;

    try {
      const response = await axios.get(`${API}/api/export/excel`, {
        params: { password, ref: refFilter },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applications_${refFilter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export failed: " + (err.response?.data?.error || err.message));
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      const nextInput = form.elements[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        e.target.blur(); // last field me keyboard band ho jaye
      }
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Customer Login Form</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* Name */} <label>Applicant Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter applicant name"
          disabled={isFieldDisabled("name")}
          required
        />
        {/* Mobile */} <label>Applicant Mobile No</label>
        <input
          type="tel"
          name="mobile"
          placeholder="Enter applicant Mobile num"
          value={formData.mobile}
          onChange={handleChange}
          disabled={isFieldDisabled("mobile")}
          required
        />
        {/* Email */} <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isFieldDisabled("email")}
          required
        />
        {/* Sales */}
        <label>Sales</label>
        <div className="radio-group">
          {[
            "Vinay Mishra",
            "Robins Kapadia",
            "Dharmesh Bhavsar",
            "Hardik Bhavsar",
            "Dhaval Kataria",
            "Parag Shah",
            "Anshul Purohit",
          ].map((salesPerson) => (
            <label key={salesPerson}>
              <input
                className="sales-radio"
                type="radio"
                name="sales"
                value={salesPerson}
                checked={formData.sales === salesPerson}
                disabled={isFieldDisabled("sales")} // ✅ uses helper
                onChange={handleChange}
              />
              {salesPerson}
            </label>
          ))}
        </div>
        {/* Ref */} <label>Reference</label>
        <input
          list="Options"
          name="ref"
          value={formData.ref}
          onChange={handleChange}
          placeholder="Select or type reference"
          disabled={isFieldDisabled("ref")}
          required
        />
        {/* Source Channel */}
        <label>Source Channel</label>
        <select
          name="sourceChannel"
          value={formData.sourceChannel}
          onChange={handleChange}
          disabled={isFieldDisabled("sourceChannel")}
          required
        >
          <option value="">Select Source</option>
          <option value="Sai Fakira">Sai Fakira</option>
          <option value="Sahdev Bhavsar">Sahdev Bhavsar</option>
          <option value="Ravi Mandaliya">Ravi Mandaliya</option>
          <option value="Hitendra Goswami">Hitendra Goswami</option>
          <option value="Vinay Mishra">Vinay Mishra</option>
          <option value="Dharmesh Bhavsar">Dharmesh Bhavsar</option>
          <option value="Robins Kapadia">Robins Kapadia</option>
          <option value="Hardik Bhavsar">Hardik Bhavsar</option>
          <option value="Parag Shah">Parag Shah</option>
          <option value="Dhaval Kataria">Dhaval Kataria</option>
          <option value="Anshul Purohit">Anshul Purohit</option>
          <option value="Other">Other</option>
        </select>
        {formData.sourceChannel === "Other" && (
          <input
            type="text"
            placeholder="Enter other Source"
            name="otherSourceChannel"
            value={formData.otherSourceChannel}
            disabled={isApprovedLock} // locked if approved
            onChange={(e) =>
              setFormData({ ...formData, otherSourceChannel: e.target.value })
            }
            required
          />
        )}
        <br />
        {/* Code */} <label>Code</label>
        <select
          name="code"
          value={formData.code}
          onChange={handleChange}
          disabled={isFieldDisabled("code")}
          required
        >
          <option value="">Select Code</option>
          <option value="Aadrika">AADRIKA</option>
          <option value="PARKER">PARKER</option>
          <option value="Sai Fakira">SAI FAKIRA</option>

          <option value="Other">Other</option>
        </select>
        {formData.code === "Other" && (
          <input
            type="text"
            name="otherCode"
            placeholder="Enter Other Code"
            value={formData.otherCode || ""}
            onChange={handleChange}
            disabled={isFieldDisabled("otherCode")}
            required
          />
        )}
        {/* Bank */} <label>Bank</label>
        <select
          name="bank"
          value={formData.bank}
          onChange={handleChange}
          disabled={isFieldDisabled("bank")}
          required
        >
          <option value="">Select Bank</option>
          <option value="Aadhar Housing">Aadhar Housing</option>
          <option value="Aaditya Birla">Aditya Birla</option>
          <option value="Aavas Finance">Aavas Finance</option>
          <option value="Axis">Axis</option>
          <option value="BOB">BOB</option>
          <option value="HDFC">HDFC</option>
          <option value="ICICI">ICICI</option>
          <option value="ICICI-HFC">ICICI-HFC</option>
          <option value="PNB-Housing Finance.ltd">
            PNB-Housing Finance.ltd
          </option>
          <option value="IDBI">IDBI</option>
          <option value="IDFC">IDFC</option>
          <option value="KOTAK">KOTAK</option>
          <option value="SMFG">SMFG</option>
          <option value="YES">YES</option>

          <option value="Other">Other</option>
        </select>
        {formData.bank === "Other" && (
          <input
            type="text"
            placeholder="Enter Bank"
            value={formData.otherBank}
            disabled={isFieldDisabled("otherBank")}
            onChange={(e) =>
              setFormData({ ...formData, otherBank: e.target.value })
            }
          />
        )}
        <br />
        {/* Banker Name */} <label>Banker Name</label>
        <input
          name="bankerName"
          placeholder="Enter Banker Name"
          value={formData.bankerName}
          onChange={handleChange}
          disabled={isFieldDisabled("bankerName")}
          required
        ></input>
        {/* ===== STATUS ===== */}
        <label>Status</label>
        <div className="radio-group">
          {[
            "Login",
            "Sanction",
            "Disbursed",
            "Part Disbursed",
            "Re-Login",
            "Rejected",
            "Withdraw",
            "Hold",
          ].map((opt) => (
            <label key={opt}>
              <input
                className="sales-radio"
                type="radio"
                name="status"
                value={opt}
                checked={formData.status === opt}
                onChange={handleChange}
                disabled={isFieldDisabled("status")}
              />
              {opt}
            </label>
          ))}
        </div>
        {/* ===== SANCTION FIELDS (only when status = Sanction) ===== */}
        {formData.status === "Sanction" && (
          <>
            <label>Sanction Date</label>
            <input
              type="date"
              name="sanctionDate"
              value={formData.sanctionDate || ""}
              onChange={handleChange}
              disabled={isFieldDisabled("sanctionDate")}
              required
            />

            <label>Sanction Amount</label>
            <input
              type="text"
              inputMode="numeric"
              name="sanctionAmount"
              placeholder="Enter sanction amount"
              value={formData.sanctionAmount || ""}
              onChange={handleChange}
              disabled={isFieldDisabled("sanctionAmount")}
              required
            />
          </>
        )}
        {/* ===== DISBURSED SECTION ===== */}
        {formData.status === "Disbursed" && (
          <>
            <label>Disbursed Date</label>
            <input
              type="date"
              name="disbursedDate"
              value={formData.disbursedDate || ""}
              onChange={handleChange}
              disabled={isFieldDisabled("disbursedDate")}
              required
            />

            <label>Disbursed Amount</label>
            <input
              type="text"
              inputMode="numeric"
              name="disbursedAmount"
              placeholder="Enter disbursed amount"
              value={formData.disbursedAmount || ""}
              onChange={handleChange}
              disabled={isFieldDisabled("disbursedAmount")}
              required
            />
            {/* ✅ New Field: Loan Amount (alphanumeric) */}
            <label>Loan Account Number</label>
            <input
              type="text"
              name="loanNumber"
              placeholder="Enter LAN"
              value={formData.loanNumber || ""}
              onChange={handleChange}
              disabled={isFieldDisabled("loanNumber")}
              pattern="[A-Za-z0-9 ]*"
              title="Only letters and numbers allowed"
              required
            />
            <label>Insurance Amount?</label>
            <div className="radio-group">
              {["Yes", "No"].map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name="insuranceOption"
                    value={opt}
                    checked={formData.insuranceOption === opt}
                    onChange={handleChange}
                    disabled={isFieldDisabled("insuranceOption")}
                  />
                  {opt}
                </label>
              ))}
            </div>

            {formData.insuranceOption === "Yes" && (
              <>
                <label>Insurance Amount</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="insuranceAmount"
                  placeholder="Enter insurance amount"
                  value={formData.insuranceAmount || ""}
                  onChange={handleChange}
                  disabled={isFieldDisabled("insuranceAmount")}
                  required
                />
              </>
            )}
          </>
        )}
        {/* ===== PART DISBURSED SECTION ===== */}
        {formData.status === "Part Disbursed" && (
          <>
            <label style={{ fontWeight: "600", marginTop: "10px" }}>
              Part Disbursed Details
            </label>

            {(formData.partDisbursed || []).map((part, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                  background: "#f9f9f9",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ flex: "1" }}>
                  <label>Part {index + 1} Date</label>
                  <input
                    type="date"
                    value={part.date || ""}
                    onChange={(e) => {
                      const updated = [...(formData.partDisbursed || [])];
                      updated[index] = {
                        ...updated[index],
                        date: e.target.value,
                      };
                      setFormData((prev) => ({
                        ...prev,
                        partDisbursed: updated,
                      }));
                    }}
                    disabled={isFieldDisabled("partDisbursed")}
                    required
                  />
                </div>

                <div style={{ flex: "1" }}>
                  <label>Part {index + 1} Amount</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    value={part.amount || ""}
                    onChange={(e) => {
                      const updated = [...(formData.partDisbursed || [])];
                      updated[index] = {
                        ...updated[index],
                        amount: e.target.value,
                      };
                      setFormData((prev) => ({
                        ...prev,
                        partDisbursed: updated,
                      }));
                    }}
                    disabled={isFieldDisabled("partDisbursed")}
                    required
                  />
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.partDisbursed.filter(
                        (_, i) => i !== index
                      );
                      setFormData((prev) => ({
                        ...prev,
                        partDisbursed: updated,
                      }));
                    }}
                    style={{
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      marginTop: "22px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const updated = [...(formData.partDisbursed || [])];
                updated.push({ date: "", amount: "" });
                setFormData((prev) => ({ ...prev, partDisbursed: updated }));
              }}
              style={{
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: "pointer",
                marginTop: "5px",
              }}
            >
              ➕ Add Another Part Disbursed
            </button>
          </>
        )}
        {/* Product */} <label>Product</label>
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          disabled={isFieldDisabled("product")}
          required
        >
          <option value="">Select Product</option>
          <option value="Home Loan">Home Loan</option>
          <option value="HL Top Up">Home Loan TOP UP</option>
          <option value="HL BT + TOP Up">Home Loan BT + TOP UP</option>
          <option value="Commercial Purchase">Commercial Purchase</option>
          <option value="LAP">Loan Against Property</option>
          <option value="Lap Top Up">Loan Against Property BT + TOP UP</option>
          <option value="Land PUR">Land Purchase</option>
          <option value="PLOT + CONSTRUCTION">
            Plot Purchase + Construction
          </option>
          <option value="LRD Pur">Lease Rental Discount Purchase</option>
          <option value="Other">Other</option>
        </select>
        {formData.product === "Other" && (
          <input
            type="text"
            placeholder="Enter Product"
            value={formData.otherProduct}
            disabled={isFieldDisabled("otherProduct")}
            onChange={(e) =>
              setFormData({ ...formData, otherProduct: e.target.value })
            }
          />
        )}
        <br />
        {/* Login Date */} <label>Login Date</label>
        <input
          type="date"
          name="loginDate"
          value={formData.loginDate}
          onChange={handleChange}
          disabled={isFieldDisabled("loginDate")} // ✅ uses helper
          required
        />
        {/* Property details */}
        <label>Property Type</label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          disabled={isFieldDisabled("propertyType")} // ✅ uses helper
          required
        >
          <option value="">Select Property Type</option>
          <option value="Residential + Builder Purchase">
            Residential(Builder Purchase)
          </option>
          <option value="Residential(Resale)">Residential(Resale)</option>
          <option value="Commercial(Builder Purchase)">
            Commercial(Builder Purchase)
          </option>
          <option value="Commercial(Resale)">Commercial(Resale)</option>
          <option value="Industrial">Industrial</option>
          <option value="Property Not Decide">Property Not Decide</option>
        </select>
        {/* {formData.bank === "Other" && (
          <input
            type="text"
            placeholder="Enter propertyType"
            value={formData.otherPropertyType}
            onChange={(e) =>
              setFormData({ ...formData, otherpropertyType: e.target.value })
            }
            required
          />
        )}
        <br /> */}
        <label>Property Details</label>
        <input
          type="text"
          name="propertyDetails"
          value={formData.propertyDetails}
          onChange={handleChange}
          placeholder="Enter Property Details"
          disabled={isFieldDisabled("propertyDetails")} // ✅ uses helper
          required
        />
        {/* Loan Amount */} <label>Market Value</label>
        <input
          type="text"
          inputMode="numeric"
          name="mktValue"
          placeholder="Enter MKT Value"
          value={formData.mktValue}
          onChange={handleChange}
          disabled={isFieldDisabled("mktValue")} // ✅ uses helper
          required
        />
        {/* Loan Amount */} <label>Req Loan Amt</label>
        <input
          type="text"
          name="amount"
          placeholder="Enter Amount"
          value={formData.amount}
          onChange={handleChange}
          disabled={isFieldDisabled("amount")} // ✅ uses helper
          required
        />
        {/* Property details */}
        <label>Rate of interest Offer</label>
        <input
          type="text"
          name="roi"
          value={formData.roi}
          onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
          placeholder="Enter ROI"
          disabled={isFieldDisabled("roi")} // ✅ uses helper
          required
        />
        {/* Processing Fees */} <label>Processing Fees</label>
        <input
          type="text"
          name="processingFees"
          placeholder="Enter processing Fees"
          value={formData.processingFees}
          onChange={handleChange}
          disabled={isFieldDisabled("processingFees")} // ✅ uses helper
          required
        />
        {/* Category */}
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={isFieldDisabled("category")} // ✅ uses helper
          required
        >
          <option value="">Select Category</option>
          <option value="salaried">Salaried</option>
          <option value="self-employed">Self-Employed</option>
          <option value="Other">Other</option>
        </select>
        {/* Show input only if category is Other */}
        {formData.category === "Other" && (
          <input
            type="text"
            placeholder="Enter other Category"
            value={formData.otherCategory}
            disabled={isFieldDisabled("otherCategory")} // ✅ uses helper
            onChange={(e) =>
              setFormData({ ...formData, otherCategory: e.target.value })
            }
          />
        )}
        {/* Audit Data */}
        <label>Audit Data:</label>
        <select
          name="auditData"
          value={formData.auditData}
          onChange={handleChange}
          disabled={isFieldDisabled("auditData")} // ✅ uses helper
          required
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {/* Consulting */} <label>Consulting</label>
        <input
          type="text"
          name="consulting"
          placeholder="Enter Consulting"
          value={formData.consulting}
          onChange={handleChange}
          disabled={isFieldDisabled("consulting")} // ✅ uses helper
          required
        />
        <label>
          Payout Pass On(%):
          <input
            type="text"
            name="payout"
            value={formData.payout}
            onChange={handleChange}
            placeholder="Enter payout amount"
            disabled={isFieldDisabled("payout")} // ✅ uses helper
            required
          />
        </label>
        <label>
          Expense Amount:
          <input
            type="text"
            name="expenceAmount"
            value={formData.expenceAmount}
            onChange={handleChange}
            disabled={isFieldDisabled("expenceAmount")} // ✅ uses helper
            placeholder="Enter Expense amount"
          />
        </label>
        <label>
          Fees Refund Amount:
          <input
            type="text"
            name="feesRefundAmount"
            value={formData.feesRefundAmount}
            onChange={handleChange}
            disabled={isFieldDisabled("feesRefundAmount")} // ✅ uses helper
            placeholder="Enter Fees Refund amount"
          />
        </label>
        <label>Remark:</label>
        <input
          type="text"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          placeholder="Enter any remark"
          disabled={isFieldDisabled("remark")} // ✅ uses helper
          required
        />
        <button type="submit" className="submit-btn">
          {editingId ? "Update" : "Submit"}
        </button>
      </form>
      {/* Filters */}
      <button onClick={handleExcelDownload} className="download-btn">
        <FaCloudDownloadAlt />
        Download Master Excel
      </button>

      <div className="sales-excel-download">
        <label className=".excel-label">Select Sales for Excel:</label>
        <select
          className="excel-select"
          value={refFilter}
          onChange={(e) => setRefFilter(e.target.value)}
        >
          <option value="">Select Sales</option>
          {[
            "Vinay Mishra",
            "Robins Kapadia",
            "Dharmesh Bhavsar",
            "Hardik Bhavsar",
            "Dhaval Kataria",
            "Parag Shah",
            "Anshul Purohit",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={handleExportRef} className="download-btn ">
          <FaCloudDownloadAlt />
          Download {refFilter || "Selected"} Excel
        </button>
      </div>
      <h2 style={{ display: "flex", justifyContent: "center" }}>
        Applications List
      </h2>
      <div className="filters">
        <label>
          From:
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </label>
        <label>
          Filter by Sales:
          <select
            value={filters.sales}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sales: e.target.value }))
            }
          >
            <option value="">All Sales</option>
            {[
              "Vinay Mishra",
              "Robins Kapadia",
              "Dharmesh Bhavsar",
              "Hardik Bhavsar",
              "Dhaval Kataria",
              "Parag Shah",
              "Anshul Purohit",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status:
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="Login">Login</option>
            <option value="Sanction">Sanction</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Part Disbursed">Part Disbursed</option>
            <option value="Re-Login">Re-Login</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>
      <div className="card-container">
        {filteredApps.map((app) => (
          <div key={app._id} className="card">
            <h2
              style={{
                margin: "5px auto",
                display: "flex",
                justifyContent: "center",
                color: "blueviolet",
                fontSize: "24px",
              }}
            >
              {app.sales}
            </h2>
            <p className="list-p">
              <b>Cust Name:</b> {app.name}
            </p>
            <p className="list-p">
              <b>Mobile:</b> {maskMobile(app.mobile)}
            </p>
            <p className="list-p">
              <b>Bank:</b> {app.bank}
            </p>
            <p className="list-p">
              <b>Banker Name:</b> {app.bankerName}
            </p>
            <p className="list-p">
              <b>Ref:</b> {app.ref}
            </p>
            <p className="list-p">
              <b>Property Type: </b>
              {app.propertyType}
            </p>
            <p className="list-p">
              <b>Source Channel:</b>{" "}
              {app.sourceChannel === "Other"
                ? app.otherSourceChannel
                : app.sourceChannel}
            </p>
            <p className="list-p">
              <b>Product:</b> {app.product}
            </p>
            <p className="list-p">
              <b>Req Loan Amount:</b> {app.amount}
            </p>
            <p className="list-p">
              <b>Status:</b> {app.status}
            </p>
            <p className="list-p">
              <b>Date:</b> {safeFormatDate(app.loginDate)}
            </p>
            {/* ✅ Show Disbursed Date only if status is Disbursed / Part Disbursed */}
            {(app.status === "Disbursed") &&
              app.disbursedDate && (
                <p className="list-p">
                  <strong>Disbursed Date:</strong>{" "}
                  {safeFormatDate(app.disbursedDate)}
                </p>
              )}
            {app.loanNumber && (
              <p className="list-p">
                <strong>Loan Account No:</strong> {app.loanNumber}
              </p>
            )}
            {/* ✅ Show Sanction details only if status is Sanction */}
            {app.status === "Sanction" && (
              <>
                {app.sanctionDate && (
                  <p className="list-p">
                    <strong>Sanction Date:</strong>{" "}
                    {safeFormatDate(app.sanctionDate)}
                  </p>
                )}

                {app.sanctionAmount && (
                  <p className="list-p">
                    <strong>Sanction Amount:</strong> {app.sanctionAmount}
                  </p>
                )}
              </>
            )}
            <p className="list-p">
              <b>Consulting: </b> {app.consulting}
            </p>{" "}
            <p className="list-p">
              <b>PayOut: </b> {app.payout}
            </p>{" "}
            <p className="list-p">
              <b>Expense: </b> {app.expenceAmount}
            </p>{" "}
            <p className="list-p">
              <b>Fees Refund: </b>
              {app.feesRefundAmount}
            </p>
            <p className="list-p">
              <b>Remark: </b>
              {app.remark}
            </p>
            {app.approvalStatus !== "Rejected by SB" && (
              <button className="edit-btn" onClick={() => handleEdit(app)}>
                ✏️ Edit
              </button>
            )}
            {/* Show warning message if exists */}
            {app.importantMsg && app.approvalStatus !== "Approved" && (
              <p className="important-msg">{app.importantMsg}</p>
            )}
            {/* ✅ Approval / Reject Section */}
            {app.approvalStatus === "Approved by SB" ? (
              <p style={{ color: "green", fontWeight: "bold" }}>
                ✅ Approved by SB
              </p>
            ) : app.approvalStatus === "Rejected by SB" ? (
              <p style={{ color: "red", fontWeight: "bold" }}>
                ❌ Rejected by SB
              </p>
            ) : (
              <div className="approval-buttons">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(app._id)}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(app._id)}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Excel Downloads */}
    </div>
  );
};

export default CustForm;
