import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/BuilderVisitForm.css"; // tumhara CSS

const BuilderVisitForm = () => {
  const API = `${import.meta.env.VITE_API_URL}/api/builder-visits`;

  const initialForm = {
    builderName: "",
    groupName: "",
    projectName: "",
    location: "",
    officePersonDetails: "",
    gentry: "",
    propertySizes: [
      {
        type: "Residential",
        size: "",
        sqft: "",
        selldedAmount: "",
        regularPrice: "",
        downPayment: "",
        maintenance: "",
        aecAuda: "",
        floor: "",
        boxPrice: "",
      },
    ],
    floor: "",
    sqft: "",
    aecAuda: "",
    regularPrice: "",
    downPayment: "",
    maintenance: "",
    developmentType: "",
    negotiable: "",
    totalUnitsBlocks: "",
    propertySize: "",
    expectedCompletionDate: "",
    financingRequirements: "",
    financingDetails: "",
    residentType: "",
    avgAgreementValue: "",
    boxPrice: "",
    nearbyProjects: "",
    enquiryType: "",
    unitsForSale: "",
    timeLimitMonths: "",
    remark: "",
    payout: "",
    stageOfConstruction: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [visits, setVisits] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 💡 Format numbers with Indian commas safely
  const formatIndian = (val) => {
    if (!val) return "";
    const num = Number(val.toString().replace(/,/g, ""));
    return isNaN(num) ? val : num.toLocaleString("en-IN");
  };

  // 🔹 Fetch all builder visits
  const fetchVisits = async () => {
    try {
      const res = await axios.get(API);
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setVisits([]);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // --- FORM INPUT HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev.propertySizes];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, propertySizes: updated };
    });
  };

  // 🏗️ Add new property block
  const addPropertySize = (type = formData.developmentType) => {
    setFormData((prev) => ({
      ...prev,
      propertySizes: [
        ...prev.propertySizes,
        {
          type,
          size: "",
          floor: "",
          sqft: "",
          aecAuda: "",
          selldedAmount: "",
          regularPrice: "",
          boxPrice: "",
          downPayment: "",
          maintenance: "",
        },
      ],
    }));
  };

  const removePropertySize = (index) => {
    setFormData((prev) => ({
      ...prev,
      propertySizes: prev.propertySizes.filter((_, i) => i !== index),
    }));
  };

  // ✏️ FIXED: When Editing — ensure property type exists
  const handleEdit = (app) => {
    setEditingId(app._id);

    const formattedPropertySizes = (app.propertySizes || []).map((p) => ({
      ...p,
      type:
        p.type ||
        (app.developmentType === "Residential + Commercial"
          ? p.floor
            ? "Commercial"
            : "Residential"
          : app.developmentType),
      // 🪄 Format commas where needed
      boxPrice: p.boxPrice ? Number(p.boxPrice).toLocaleString("en-IN") : "",
      downPayment: p.downPayment
        ? Number(p.downPayment).toLocaleString("en-IN")
        : "",
    }));

    setFormData({
      ...app,
      propertySizes: formattedPropertySizes,
      avgAgreementValue: app.avgAgreementValue
        ? Number(app.avgAgreementValue).toLocaleString("en-IN")
        : "",
      boxPrice: app.boxPrice
        ? Number(app.boxPrice).toLocaleString("en-IN")
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // --- FORM SUBMIT / UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanPropertySizes = formData.propertySizes.map((p) => ({
        ...p,
        regularPrice: (p.regularPrice || "").replace(/,/g, ""),
        downPayment: (p.downPayment || "").replace(/,/g, ""),
        maintenance: (p.maintenance || "").replace(/,/g, ""),
        boxPrice: (p.boxPrice || "").replace(/,/g, ""),
      }));

      const cleanData = {
        ...formData,
        avgAgreementValue: (formData.avgAgreementValue || "").replace(/,/g, ""),
        boxPrice: (formData.boxPrice || "").replace(/,/g, ""),
        propertySizes: cleanPropertySizes,
      };

      if (editingId) {
        await axios.patch(`${API}/${editingId}`, cleanData);
        alert("✅ Data updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(API, cleanData);
        alert("✅ Form submitted successfully!");
      }

      setFormData(initialForm);
      fetchVisits();
    } catch (err) {
      console.error("❌ Submit Error:", err);
      alert("❌ Failed to submit form.");
    }
  };

  // 🔹 Approve Visit
  const handleApprove = async (id) => {
    const password = prompt("Enter approval password:");
    if (!password) return;

    try {
      await axios.patch(`${API}/${id}/approve`, { password });
      alert("✅ Application approved successfully!");
      fetchVisits();
    } catch (err) {
      console.error("❌ Approval failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Invalid password!");
      } else {
        alert("Approval failed. Try again.");
      }
    }
  };

  // 🔹 Reject Visit
  const handleReject = async (id) => {
    const password = prompt("Enter approval password:");
    if (!password) return;

    try {
      await axios.patch(`${API}/${id}/reject`, { password });
      alert("❌ Application rejected successfully!");
      fetchVisits();
    } catch (err) {
      console.error("❌ Rejection failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Invalid password!");
      } else {
        alert("Rejection failed. Try again.");
      }
    }
  };

  // 🔹 Export Excel
  const handleExportExcel = async () => {
    try {
      const enteredPassword = prompt("Enter password to download Excel:");
      if (!enteredPassword) return;

      const res = await axios.get(
        `${API}/export/excel?password=${enteredPassword}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Builder_Visits.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Download failed");
    }
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toISOString().split("T")[0] : "";

  return (
    <div className="form-container">
      <h2 className="form-title">Project Login Form</h2>
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            form.elements[index + 1]?.focus(); // next input pe focus karega
          }
        }}
      >
        <div className="form-grid">
          <label>
            Builder Name:
            <input
              placeholder="Enter Builder Name"
              type="text"
              name="builderName"
              value={formData.builderName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Group Name:
            <input
              type="text"
              placeholder="Enter Group Name"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
            />
          </label>

          <label>
            Project Name:
            <input
              type="text"
              placeholder="Enter Project Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
            />
          </label>

          <label>
            Location/Address:
            <input
              type="text"
              placeholder="Enter Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </label>

          <label className="full-width">
            Developer Office Person Details:
            <input
              type="text"
              placeholder="Name, Designation, Contact"
              name="officePersonDetails"
              value={formData.officePersonDetails}
              onChange={handleChange}
            />
          </label>
          {/* -------------------- DEVELOPMENT TYPE -------------------- */}
          <div className="radio-group full-width">
            <p className="radio-label">Type of Development:</p>
            {["Residential", "Commercial", "Residential + Commercial"].map(
              (type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="developmentType"
                    value={type}
                    checked={formData.developmentType === type}
                    onChange={handleChange}
                  />
                  {type}
                </label>
              )
            )}
          </div>

          {/* -------------------- PROPERTY SECTION (SHARED TEMPLATE) -------------------- */}
          {["Residential", "Commercial"]
            .filter(
              (type) =>
                formData.developmentType === type ||
                formData.developmentType === "Residential + Commercial"
            )
            .map((type) => (
              <div key={type} className="property-section">
                <h3 className="section-title">
                  {type === "Residential" ? "🏠 Residential" : "🏢 Commercial"}{" "}
                  Properties
                </h3>

                {formData.propertySizes.map((prop, index) => {
                  if (prop.type !== type) return null; // Only render matching type

                  return (
                    <div key={index} className="conditional-fields">
                      <h4>
                        {type} Property Type {index + 1}
                      </h4>

                      {/* Unique field per type */}
                      {type === "Residential" ? (
                        <label>
                          Size:
                          <select
                            name="size"
                            value={prop.size}
                            onChange={(e) => handlePropertyChange(index, e)}
                          >
                            <option value="">Select</option>
                            <option>2 BHK</option>
                            <option>3 BHK</option>
                            <option>3 BHK (PentHouse)</option>
                            <option>4 BHK</option>
                            <option>4 BHK (PentHouse)</option>
                            <option>5 BHK</option>
                            <option>5 BHK (PentHouse)</option>
                          </select>
                        </label>
                      ) : (
                        <label>
                          Floor:
                          <select
                            name="floor"
                            value={prop.floor}
                            onChange={(e) => handlePropertyChange(index, e)}
                          >
                            <option value="">Select</option>
                            <option>Ground Floor</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>Office</option>
                          </select>
                        </label>
                      )}
                      {[
                        ["sqft", "SQ.FT/YD"],
                        ["aecAuda", "AEC / AUDA"],
                        ["maintenance", "Maintenance"],
                        ["selldedAmount", "SaleDeed Amount"],
                        ["boxPrice", "Box Price"],
                        ["downPayment", "Down Payment"],
                      ].map(([name, label]) => (
                        <label key={name}>
                          {label}:
                          <input
                            type="text"
                            name={name}
                            placeholder={`Enter ${label}`}
                            value={prop[name]}
                            onChange={(e) => {
                              let value = e.target.value;

                              // ✅ only apply comma formatting to selected fields
                              if (["boxPrice", "downPayment"].includes(name)) {
                                value = value.replace(/,/g, ""); // remove commas first
                                if (!isNaN(value) && value !== "") {
                                  const formattedValue =
                                    Number(value).toLocaleString("en-IN");
                                  handlePropertyChange(index, {
                                    target: { name, value: formattedValue },
                                  });
                                  return;
                                } else if (value === "") {
                                  handlePropertyChange(index, {
                                    target: { name, value: "" },
                                  });
                                  return;
                                }
                              }

                              // 🧾 for sqft & aecAuda → plain update (no commas)
                              handlePropertyChange(index, e);
                            }}
                          />
                        </label>
                      ))}

                      {/* {formData.propertySizes.length > 1 && (
                        <button
                          type="button"
                          className="property-btn remove-btn"
                          onClick={() => removePropertySize(index)}
                        >
                          Remove
                        </button>
                      )} */}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="property-btn add-btn"
                  onClick={() => addPropertySize(type)}
                >
                  Add {type} Property
                </button>
              </div>
            ))}
          <div className="radio-group full-width">
            <p className="radio-label"> Price Negotiable:</p>
            <label>
              <input
                type="radio"
                name="negotiable"
                value="Yes"
                checked={formData.negotiable === "Yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="negotiable"
                value="No"
                checked={formData.negotiable === "No"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
          <label>
            Total Units & Blocks:
            <input
              placeholder=" Enter Total Units & Blocks"
              type="text"
              name="totalUnitsBlocks"
              value={formData.totalUnitsBlocks}
              onChange={handleChange}
            />
          </label>

          <label>
            Stage of Construction:
            <input
              placeholder=" Enter Stage of Construction"
              type="text"
              name="stageOfConstruction"
              value={formData.stageOfConstruction}
              onChange={handleChange}
            />
          </label>
          {(formData.developmentType === "Residential" ||
            formData.developmentType === "Residential + Commercial") && (
            <label className="full-width">
              Gentry:
              <input
                placeholder="Enter gentry"
                type="text"
                name="gentry"
                value={formData.gentry}
                onChange={handleChange}
              />
            </label>
          )}

          <label>
            Expected Completion Month:
            <input
              type="month"
              name="expectedCompletionDate"
              value={formData.expectedCompletionDate}
              onChange={handleChange}
            />
          </label>

          <div className="radio-group full-width">
            <p className="radio-label">Project Loan Awail :</p>
            <label>
              <input
                type="radio"
                name="financingRequirements"
                value="Yes"
                checked={formData.financingRequirements === "Yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="financingRequirements"
                value="No"
                checked={formData.financingRequirements === "No"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
          <label className="full-width">
            Nearby Similar Projects:
            <textarea
              placeholder="Enter Nearby Other Projects"
              name="nearbyProjects"
              value={formData.nearbyProjects}
              onChange={handleChange}
            />
          </label>

          <label>
            Enquiry Type:
            <select
              name="enquiryType"
              value={formData.enquiryType}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>Salaried</option>
              <option>Self-employed</option>
              <option>Both</option>
            </select>
          </label>

          <label>
            Units Allocated for Sale
            <input
              placeholder="Enter Units to be sold by us"
              type="string"
              name="unitsForSale"
              value={formData.unitsForSale}
              onChange={handleChange}
            />
          </label>

          <label>
            Time Limit for Sale Months (Group Project):
            <input
              placeholder="Enter Time Limit for Sale (Months)"
              type="number"
              name="timeLimitMonths"
              value={formData.timeLimitMonths}
              onChange={handleChange}
            />
          </label>

          <label className="full-width">
            Remark:
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Any extra comments or notes"
            />
          </label>
          <label className="full-width">
            Payout (Group Project):
            <input
              type="text"
              name="payout"
              value={formData.payout}
              onChange={handleChange}
              placeholder="Enter payout details"
            />
          </label>

          <button type="submit" className="submit-btn">
            {editingId ? "Update Form" : "Submit Form"}
          </button>
        </div>
      </form>
      <div className="excel-export-section">
        <button onClick={handleExportExcel} className="download-btn">
          Export Excel
        </button>
      </div>

      {visits.map((v) => (
        <div key={v._id} className="visit-card">
          <h3 className="card-title">{v.projectName}</h3>

          <div className="card-section">
            <p>
              <strong>Builder:</strong> {v.builderName}
            </p>
            <p style={{backgroundColor:"yellow"}}>
              <strong>Group:</strong> {v.groupName}
            </p>
            <p>
              <strong>Location:</strong> {v.location}
            </p>
            <p>
              <strong>Development Type:</strong> {v.developmentType}
            </p>
          </div>
          <div className="card-section">
            {v.propertySizes?.map((p, i) => (
              <div key={i} className="card-property">
                <p>
                  <strong>Property {i + 1}</strong>
                </p>
                {v.developmentType === "Residential" && <p style={{backgroundColor:"yellow"}}>Size : {p.size}</p>}
                {v.developmentType === "Commercial" && <p style={{backgroundColor:"yellow"}}>Floor : {p.floor}</p>}
                {v.developmentType === "Residential + Commercial" && (
                  <>
                    {p.size && <p style={{backgroundColor:"yellow"}}>Size : {p.size}</p>}
                    {p.floor && <p style={{backgroundColor:"yellow"}}>Floor : {p.floor}</p>}
                  </>
                )}
                <p style={{backgroundColor:"yellow"}}>SQ.FT/Yard : {p.sqft}</p>
                <p style={{backgroundColor:"yellow"}}>Box Price : {formatIndian(p.boxPrice)}</p>
                <p>Approximate SaleDeed Amount : {p.selldedAmount}</p>
                {/* stamp duty here add */}
                <p>AEC / AUDA : {p.aecAuda}</p>
                <p>Maintenance : {p.maintenance}</p>
                <p>Down Payment : {formatIndian(p.downPayment)}</p>
              </div>
            ))}
          </div>
          <div className="card-section2">
            <p>
              <strong>Project Loan Awail:</strong> {v.financingRequirements}
            </p>
            <p>
              <strong>Gentry:</strong> {v.gentry}
            </p>
            <p style={{backgroundColor:"yellow"}}>
              <strong>Payout(Group Project):</strong> {v.payout}
            </p>
            <p>
              <strong>Total Units / Blocks:</strong> {v.totalUnitsBlocks}
            </p>
            <p>
              <strong>Stage Of Construction:</strong> {v.stageOfConstruction}
            </p>
            <p>
              <strong>Completion Date:</strong>{" "}
              {v.expectedCompletionDate
                ? new Date(v.expectedCompletionDate + "-01").toLocaleDateString(
                    "en-GB",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )
                : ""}
            </p>

            <p>
              <strong>Units for Sale: </strong> {v.unitsForSale}
            </p>
            <p>
              <strong>Time Limit for Sale (Months):</strong> {v.timeLimitMonths}
            </p>
            <p style={{backgroundColor:"yellow"}}>
              <strong>Remark:</strong>
              {v.remark}
            </p>
          </div>
          <p style={{ fontSize: "20px" }}>
            <strong>Status:</strong>{" "}
            <span
              className={`status ${
                v.approvalStatus === "Approved"
                  ? "approved"
                  : v.approvalStatus === "Rejected"
                  ? "rejected"
                  : "pending"
              }`}
            >
              {v.approvalStatus}
            </span>
          </p>

          <div className="card-buttons">
            {v.approvalStatus === "Pending" && (
              <>
                <button onClick={() => handleApprove(v._id)}>Approve</button>
                <button onClick={() => handleReject(v._id)}>Reject</button>
                <button onClick={() => handleEdit(v)}>Edit</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BuilderVisitForm;
