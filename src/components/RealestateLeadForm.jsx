import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/custForm.css";
import "./RealestateLeadForm.css";

const API = `${import.meta.env.VITE_API_URL}/api/realestate-leads`;

const TODAY = new Date().toISOString().split("T")[0];

const SOURCE_OPTIONS = [
  "Existing Customer",
  "Paid Marketing",
  "Refer & Earn",
  "WhatsApp Paid Marketing",
  "Channel Partner Lead",
];

const STATUS_OPTIONS = [
  "Ringing",
  "Call Not Connected",
  "Not Interested",
  "Call Connected",
  "Interested",
];

const INTERESTED_STATUSES = ["Call Connected", "Interested"];

const RESIDENTIAL_SIZES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6+ BHK"];

const RESIDENTIAL_CATEGORIES = [
  "Flats",
  "Bungalow",
  "PentHouse",
  "Duplex",
  "Duplex PentHouse",
  "Triplex",
  "Triplex PentHouse",
  "Weekend Villa",
];

const COMMERCIAL_TYPES = ["Shop", "Showroom", "Office"];

const MANAGERS = [
  "Dharmesh Bhavsar",
  "Robins Kapadia",
  "Vinay Mishra",
  "Harsh Brahmbhatt",
  "Niraj Gelot",
  "Mehul Prajapati",
];

const RealestateLeadForm = () => {
  const [leadDate, setLeadDate] = useState(TODAY);
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [source, setSource] = useState("");
  const [referenceOf, setReferenceOf] = useState("");

  // Universal Property Requirements (Root level)
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [residentialSize, setResidentialSize] = useState("");
  const [residentialCategory, setResidentialCategory] = useState("");
  const [commercialType, setCommercialType] = useState("");

  // Calls history - default 1 call
  const [calls, setCalls] = useState([
    { callingDate: TODAY, manager: "", status: "", remarks: "", followUpDate: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); // 'submitting' | 'success' | 'error' | null
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  // Leads list state
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(API);
      setLeads(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerNumber?.includes(searchTerm)
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const truncate = (str, len) => {
    if (!str) return "";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  // Auto-hide modal on success/error
  useEffect(() => {
    if (modalStatus === "success") {
      const timer = setTimeout(() => {
        setModalStatus(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [modalStatus]);

  const isRequirementNeeded = calls.some((c) => INTERESTED_STATUSES.includes(c.status));

  const addCall = () => {
    setCalls((prev) => [...prev, { callingDate: TODAY, manager: "", status: "", remarks: "", followUpDate: "" }]);
  };

  const removeCall = (idx) => {
    if (calls.length <= 1) return;
    setCalls((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCall = (idx, field, value) => {
    setCalls((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
    setErrors((p) => {
      const newE = { ...p };
      delete newE[`call_${idx}_${field}`];
      return newE;
    });
  };

  const validate = () => {
    const e = {};
    
    // Only validate customer info in create mode
    if (!isEditMode) {
      if (!leadDate) e.leadDate = "Required.";
      if (!customerName.trim()) e.customerName = "Required.";
      if (!customerNumber) {
        e.customerNumber = "Required.";
      } else if (!/^\d{10}$/.test(customerNumber)) {
        e.customerNumber = "10 digits.";
      }
      if (!source) e.source = "Required.";
    }

    calls.forEach((c, i) => {
      if (!c.callingDate) e[`call_${i}_callingDate`] = "Required.";
      if (!c.manager) e[`call_${i}_manager`] = "Required.";
      if (!c.status) e[`call_${i}_status`] = "Required.";
    });

    if (isRequirementNeeded) {
      if (!propertyType) e.propertyType = "Required.";
      if (!budget.trim()) e.budget = "Required.";
      if (!preferredArea.trim()) e.preferredArea = "Required.";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrorMsg("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setModalStatus("submitting");

    try {
      if (isEditMode) {
        // Update existing lead
        const payload = {
          propertyType,
          budget,
          preferredArea,
          residentialSize,
          residentialCategory,
          commercialType,
          calls,
        };

        await axios.put(`${API}/${editingLeadId}`, payload);
        setModalStatus("success");
      } else {
        // Create new lead
        const payload = {
          leadDate,
          customerName,
          customerNumber,
          source,
          referenceOf,
          propertyType,
          budget,
          preferredArea,
          residentialSize,
          residentialCategory,
          commercialType,
          calls,
        };

        await axios.post(API, payload);
        setModalStatus("success");
      }
      
      // Reset form
      resetForm();
      
      // Refresh list
      fetchLeads();
    } catch (err) {
      console.error("Submit error:", err);
      setModalStatus("error");
      setServerErrorMsg(err?.response?.data?.message || `❌ Failed to ${isEditMode ? 'update' : 'submit'} lead.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerNumber("");
    setSource("");
    setReferenceOf("");
    setPropertyType("");
    setBudget("");
    setPreferredArea("");
    setResidentialSize("");
    setResidentialCategory("");
    setCommercialType("");
    setCalls([{ callingDate: TODAY, manager: "", status: "", remarks: "", followUpDate: "" }]);
    setErrors({});
    setIsEditMode(false);
    setEditingLeadId(null);
  };

  const handleEdit = (lead) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set edit mode
    setIsEditMode(true);
    setEditingLeadId(lead._id);
    
    // Load customer details (read-only in edit mode)
    setLeadDate(lead.leadDate ? new Date(lead.leadDate).toISOString().split("T")[0] : TODAY);
    setCustomerName(lead.customerName || "");
    setCustomerNumber(lead.customerNumber || "");
    setSource(lead.source || "");
    setReferenceOf(lead.referenceOf || "");
    
    // Load editable fields
    setPropertyType(lead.propertyType || "");
    setBudget(lead.budget || "");
    setPreferredArea(lead.preferredArea || "");
    setResidentialSize(lead.residentialSize || "");
    setResidentialCategory(lead.residentialCategory || "");
    setCommercialType(lead.commercialType || "");
    
    // Load calls
    const formattedCalls = lead.calls.map(c => ({
      callingDate: c.callingDate ? new Date(c.callingDate).toISOString().split("T")[0] : TODAY,
      manager: c.manager || "",
      status: c.status || "",
      remarks: c.remarks || "",
      followUpDate: c.followUpDate ? new Date(c.followUpDate).toISOString().split("T")[0] : "",
    }));
    setCalls(formattedCalls.length > 0 ? formattedCalls : [{ callingDate: TODAY, manager: "", status: "", remarks: "", followUpDate: "" }]);
    
    setErrors({});
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const err = (key) =>
    errors[key] ? <span className="rl-error">{errors[key]}</span> : null;

  return (
    <div className="rl-page-container">
      {/* ── Center Container for Form ── */}
      <div className="rl-main-center-wrap">
        <div className="form-container rl-form-container">
          <div className="form-title-row">
            <h1 className="rl-title">
              {isEditMode ? "Edit Real-Estate Lead" : "Real-Estate Lead Form"}
            </h1>
            {isEditMode && (
              <button type="button" className="rl-cancel-edit-btn" onClick={handleCancelEdit}>
                ✕ Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* SECTION 1 — Customer Info */}
            <div className="rl-section-card">
              <div className="rl-section-header">
                <span className="rl-section-badge">1</span>
                <span className="rl-section-title">Customer Information</span>
                {isEditMode && <span className="rl-readonly-badge">Read-Only</span>}
              </div>
              <div className="rl-grid-3">
                <div className="rl-field">
                  <label className="rl-label">Lead Date <span className="required-asterisk">*</span></label>
                  <input
                    type="date"
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    className={`rl-input${errors.leadDate ? " rl-input-error" : ""}`}
                    disabled={isEditMode}
                  />
                  {err("leadDate")}
                </div>
                <div className="rl-field">
                  <label className="rl-label">Customer Name <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`rl-input${errors.customerName ? " rl-input-error" : ""}`}
                    disabled={isEditMode}
                  />
                  {err("customerName")}
                </div>
                <div className="rl-field">
                  <label className="rl-label">Customer Number <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="10-digit mobile"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ""))}
                    className={`rl-input${errors.customerNumber ? " rl-input-error" : ""}`}
                    disabled={isEditMode}
                  />
                  {err("customerNumber")}
                </div>
                <div className="rl-field">
                  <label className="rl-label">Source <span className="required-asterisk">*</span></label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className={`rl-input rl-select${errors.source ? " rl-input-error" : ""}`}
                    disabled={isEditMode}
                  >
                    <option value="">Select Source</option>
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {err("source")}
                </div>
                <div className="rl-field">
                  <label className="rl-label">Reference Of</label>
                  <input
                    type="text"
                    placeholder="Reference Name"
                    value={referenceOf}
                    onChange={(e) => setReferenceOf(e.target.value)}
                    className="rl-input"
                    disabled={isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 — Call Records */}
            <div className="rl-calls-wrapper">
              <div className="rl-calls-header">
                <div className="rl-calls-title-row">
                  <span className="rl-section-badge">2</span>
                  <span className="rl-section-title">Call Records</span>
                  <span className="rl-call-count">{calls.length} Call(s)</span>
                </div>
                <button type="button" className="rl-add-call-btn" onClick={addCall}>+ Add Call</button>
              </div>

              {calls.map((call, idx) => (
                <div key={idx} className="rl-call-card">
                  <div className="rl-call-card-header">
                    <span className="rl-call-badge">Call #{idx + 1}</span>
                    {calls.length > 1 && (
                      <button type="button" className="rl-remove-btn" onClick={() => removeCall(idx)}>✕ Remove</button>
                    )}
                  </div>
                  <div className="rl-grid-3">
                    <div className="rl-field">
                      <label className="rl-label">Calling Date <span className="required-asterisk">*</span></label>
                      <input
                        type="date"
                        value={call.callingDate}
                        onChange={(e) => updateCall(idx, "callingDate", e.target.value)}
                        className={`rl-input${errors[`call_${idx}_callingDate`] ? " rl-input-error" : ""}`}
                      />
                      {err(`call_${idx}_callingDate`)}
                    </div>
                    <div className="rl-field">
                      <label className="rl-label">Manager <span className="required-asterisk">*</span></label>
                      <select
                        value={call.manager}
                        onChange={(e) => updateCall(idx, "manager", e.target.value)}
                        className={`rl-input rl-select${errors[`call_${idx}_manager`] ? " rl-input-error" : ""}`}
                      >
                        <option value="">Select Manager</option>
                        {MANAGERS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      {err(`call_${idx}_manager`)}
                    </div>
                    <div className="rl-field">
                      <label className="rl-label">Status <span className="required-asterisk">*</span></label>
                      <select
                        value={call.status}
                        onChange={(e) => updateCall(idx, "status", e.target.value)}
                        className={`rl-input rl-select${errors[`call_${idx}_status`] ? " rl-input-error" : ""}`}
                      >
                        <option value="">Select Status</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {err(`call_${idx}_status`)}
                    </div>
                  </div>
                  <div className="rl-grid-2" style={{ marginTop: "12px" }}>
                    <div className="rl-field">
                      <label className="rl-label">Follow Up Date</label>
                      <input
                        type="date"
                        value={call.followUpDate}
                        onChange={(e) => updateCall(idx, "followUpDate", e.target.value)}
                        className="rl-input"
                      />
                    </div>
                    <div className="rl-field">
                      <label className="rl-label">Remarks</label>
                      <textarea
                        rows={1}
                        placeholder="Notes..."
                        value={call.remarks}
                        onChange={(e) => updateCall(idx, "remarks", e.target.value)}
                        className="rl-input rl-textarea"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 3 — Universal Requirements (Conditional) */}
            {isRequirementNeeded && (
              <div className="rl-section-card rl-animate-in" style={{ borderTop: "2px solid #1e3a5f" }}>
                <div className="rl-section-header">
                  <span className="rl-section-badge">3</span>
                  <span className="rl-section-title">Requirements Details</span>
                </div>
                <div className="rl-grid-3">
                  <div className="rl-field">
                    <label className="rl-label">Budget <span className="required-asterisk">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 80 Lacs"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className={`rl-input${errors.budget ? " rl-input-error" : ""}`}
                    />
                    {err("budget")}
                  </div>
                  <div className="rl-field">
                    <label className="rl-label">Preferred Area <span className="required-asterisk">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Bodakdev"
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                      className={`rl-input${errors.preferredArea ? " rl-input-error" : ""}`}
                    />
                    {err("preferredArea")}
                  </div>
                  <div className="rl-field">
                    <label className="rl-label">Property Type <span className="required-asterisk">*</span></label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className={`rl-input rl-select${errors.propertyType ? " rl-input-error" : ""}`}
                    >
                      <option value="">Select Type</option>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Plot</option>
                    </select>
                    {err("propertyType")}
                  </div>
                </div>

                {propertyType === "Residential" && (
                  <div className="rl-grid-2 rl-animate-in" style={{ marginTop: "15px" }}>
                    <div className="rl-field">
                      <label className="rl-label">Size</label>
                      <select
                        value={residentialSize}
                        onChange={(e) => setResidentialSize(e.target.value)}
                        className="rl-input rl-select"
                      >
                        <option value="">Select Size</option>
                        {RESIDENTIAL_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="rl-field">
                      <label className="rl-label">Category</label>
                      <select
                        value={residentialCategory}
                        onChange={(e) => setResidentialCategory(e.target.value)}
                        className="rl-input rl-select"
                      >
                        <option value="">Select Category</option>
                        {RESIDENTIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {propertyType === "Commercial" && (
                  <div className="rl-field rl-animate-in" style={{ marginTop: "15px", maxWidth: "33%" }}>
                    <label className="rl-label">Commercial Type</label>
                    <select
                      value={commercialType}
                      onChange={(e) => setCommercialType(e.target.value)}
                      className="rl-input rl-select"
                    >
                      <option value="">Select Type</option>
                      {COMMERCIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="rl-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update Lead" : "Submit Lead")}
            </button>
          </form>
        </div>

        {/* ── Submission Feedback Modal ── */}
        {modalStatus && (
          <div className="rl-modal-overlay">
            <div className="rl-modal-content">
              {modalStatus === "submitting" && (
                <>
                  <div className="rl-spinner"></div>
                  <div className="rl-modal-title">{isEditMode ? "Updating Lead" : "Submitting Lead"}</div>
                  <div className="rl-modal-text">Please wait while we save your data...</div>
                </>
              )}
              {modalStatus === "success" && (
                <>
                  <span className="rl-modal-icon">✅</span>
                  <div className="rl-modal-title">Success!</div>
                  <div className="rl-modal-text">The lead has been {isEditMode ? "updated" : "recorded"} successfully.</div>
                </>
              )}
              {modalStatus === "error" && (
                <>
                  <span className="rl-modal-icon">❌</span>
                  <div className="rl-modal-title">Submission Failed</div>
                  <div className="rl-modal-text">{serverErrorMsg}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Leads Gallery display (Vertical Record Grid - Redesigned) ── */}
        <div className="rl-list-section">
          <div className="rl-list-header">
            <h2 className="rl-list-title">Existing Lead Records</h2>
            <div className="rl-list-search">
              <input 
                type="text" 
                placeholder="Search by name or mobile..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rl-input rl-search-bar"
              />
            </div>
          </div>

          {loadingLeads ? (
            <div className="rl-loader-inline">
               <span>Fetching records...</span>
            </div>
          ) : (
            <div className="rl-record-grid">
              {filteredLeads.length === 0 ? (
                <div className="rl-empty-list">No matches found.</div>
              ) : (
                filteredLeads.map((lead) => (
                  <div key={lead._id} className="rl-record-card">
                    {/* Header: Latest Manager */}
                    <div className="rl-record-header">
                      <span className="rl-record-manager">{lead.calls[lead.calls.length - 1]?.manager || "No Agent"}</span>
                      <span className="rl-record-badge">LEAD</span>
                    </div>

                    <div className="rl-record-body">
                      {/* Row 1: Cust Name & Mobile */}
                      <div className="rl-record-row-2">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">CUST NAME</label>
                          <span className="rl-record-val">{lead.customerName}</span>
                        </div>
                        <div className="rl-record-cell">
                          <label className="rl-record-label">MOBILE</label>
                          <span className="rl-record-val">{lead.customerNumber}</span>
                        </div>
                      </div>

                      {/* Row 2: Reference */}
                      <div className="rl-record-row-1">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">REF</label>
                          <span className="rl-record-val">{lead.referenceOf || "N/A"}</span>
                        </div>
                      </div>

                      {/* Row 3: Product (Source) & Property Type */}
                      <div className="rl-record-row-2">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">SOURCE</label>
                          <span className="rl-record-val">{lead.source}</span>
                        </div>
                        <div className="rl-record-cell">
                          <label className="rl-record-label">PROPERTY TYPE</label>
                          <span className="rl-record-val">{lead.propertyType || "N/A"}</span>
                        </div>
                      </div>

                      {/* Row 4: Budget & Area */}
                      <div className="rl-record-row-2">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">BUDGET</label>
                          <span className="rl-record-val">{lead.budget || "N/A"}</span>
                        </div>
                        <div className="rl-record-cell">
                          <label className="rl-record-label">PREFERRED AREA</label>
                          <span className="rl-record-val">{lead.preferredArea || "N/A"}</span>
                        </div>
                      </div>

                      {/* Row 5: Lead Date */}
                      <div className="rl-record-row-1">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">LEAD GENERATED ON</label>
                          <span className="rl-record-val">{formatDate(lead.leadDate)}</span>
                        </div>
                      </div>

                      {/* Row 6: Interaction Status */}
                      <div className="rl-record-row-1">
                        <div className="rl-record-cell">
                          <label className="rl-record-label">LAST STATUS</label>
                          <span className={`rl-record-val rl-status-text status-${(lead.calls[lead.calls.length - 1]?.status || "unknown").toLowerCase().replace(/\s+/g, '-')}`}>
                            {lead.calls[lead.calls.length - 1]?.status || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Row 7: Follow up (if any) */}
                      {lead.calls.some(c => c.followUpDate) && (
                        <div className="rl-record-row-1">
                          <div className="rl-record-cell">
                            <label className="rl-record-label">NEXT FOLLOW UP</label>
                            <span className="rl-record-val rl-followup-alert">
                              {formatDate(lead.calls.find(c => c.followUpDate)?.followUpDate)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rl-record-footer">
                      <button className="rl-edit-btn" onClick={() => handleEdit(lead)}>✎ Edit</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealestateLeadForm;
