import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  form1TemplateId: import.meta.env.VITE_EMAILJS_FORM1_TEMPLATE_ID,
  form2TemplateId: import.meta.env.VITE_EMAILJS_FORM2_TEMPLATE_ID,
  level2ApprovalTemplateId: import.meta.env.VITE_EMAILJS_LEVEL2_APPROVAL_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

/**
 * Send email notification for Form 1 (Customer Login Form)
 * @param {Object} formData - The form data to send
 * @returns {Promise<Object>} - Success/error response
 */
export const sendForm1Notification = async (formData) => {
  try {
    const templateParams = {
      to_email: import.meta.env.VITE_ADMIN1_EMAIL,
      subject: "New MIS Form Submission",
      applicant_name: formData.name || "N/A",
      mobile: formData.mobile || "N/A",
      email: formData.email || "N/A",
      sales: formData.sales || "N/A",
      reference: formData.ref || "N/A",
      source_channel: formData.sourceChannel || "N/A",
      code: formData.code || "N/A",
      bank: formData.bank || "N/A",
      banker_name: formData.bankerName || "N/A",
      status: formData.status || "N/A",
      login_date: formData.loginDate || "N/A",
      amount: formData.amount || "N/A",
      product: formData.product || "N/A",
      remark: formData.remark || "N/A",
      submission_date: new Date().toLocaleString('en-IN'),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.form1TemplateId,
      templateParams
    );

    return {
      success: true,
      message: "Email notification sent successfully",
      response,
    };
  } catch (error) {
    console.error("EmailJS Error (Form 1):", error);
    return {
      success: false,
      message: error.text || "Failed to send email notification",
      error,
    };
  }
};

/**
 * Send email notification for Form 2 (Real Estate/Builder Visit Form)
 * @param {Object} formData - The form data to send
 * @returns {Promise<Object>} - Success/error response
 */
export const sendForm2Notification = async (formData) => {
  try {
    // Set a timeout for email sending (10 seconds max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 10000);
    });

    // Format property details
    const propertyDetails = formData.propertySizes?.map((prop, index) => {
      return `Property ${index + 1}: ${prop.type || 'N/A'} - ${prop.size || prop.floor || 'N/A'}, SQ.FT: ${prop.sqft || 'N/A'}, Box Price: ${prop.boxPrice || 'N/A'}`;
    }).join('\n') || "No properties added";

    // Format executives
    const executivesDetails = formData.executives?.map((exec, index) => {
      return `${index + 1}. ${exec.name || 'N/A'} - ${exec.number || 'N/A'}`;
    }).join('\n') || "No executives added";

    // Format USPs
    const uspsDetails = formData.usps?.join(', ') || "No USPs selected";

    const templateParams = {
      to_email: `${import.meta.env.VITE_ADMIN1_EMAIL || ''}, ${import.meta.env.VITE_ADMIN2_EMAIL || ''}`.trim().replace(/^,|,$/g, ''),
      subject: "New Real Estate Form Submission",
      project_name: formData.projectName || "N/A",
      group_name: formData.groupName || "N/A",
      developer_name: formData.builderName || "N/A",
      developer_number: formData.builderNumber || "N/A",
      location: formData.location || "N/A",
      development_type: formData.developmentType || "N/A",
      office_person: formData.officePersonDetails || "N/A",
      office_person_number: formData.officePersonNumber || "N/A",
      executives: executivesDetails,
      property_details: propertyDetails,
      total_units: formData.totalUnitsBlocks || "N/A",
      total_blocks: formData.totalBlocks || "N/A",
      stage_of_construction: formData.stageOfConstruction || "N/A",
      completion_date: formData.expectedCompletionDate || "N/A",
      enquiry_type: formData.enquiryType || "N/A",
      units_for_sale: formData.unitsForSale || "N/A",
      usps: uspsDetails,
      total_amenities: formData.totalAmenities || "N/A",
      alloted_car_parking: formData.allotedCarParking || "N/A",
      payout: formData.payout || "N/A",
      manager: formData.saiFakiraManager || "N/A",
      remark: formData.remark || "N/A",
      submission_date: new Date().toLocaleString('en-IN'),
    };

    const emailPromise = emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.form2TemplateId,
      templateParams
    );

    // Race between email sending and timeout
    const response = await Promise.race([emailPromise, timeoutPromise]);

    return {
      success: true,
      message: "Email notification sent successfully",
      response,
    };
  } catch (error) {
    console.error("EmailJS Error (Form 2):", error);
    return {
      success: false,
      message: error.message === 'Email sending timeout' ? "Email sending timed out" : (error.text || "Failed to send email notification"),
      error,
    };
  }
};

/**
 * Send email notification for Level 2 Approval
 * @param {Object} data - The approval data
 * @returns {Promise<Object>} - Success/error response
 */
export const sendLevel2ApprovalNotification = async (data) => {
  try {
    const templateParams = {
      to_email: `${import.meta.env.VITE_ADMIN1_EMAIL}, ${import.meta.env.VITE_ADMIN2_EMAIL}`,
      subject: "Form Fully Approved (Level 2 Completed)",
      project_name: data.projectName || "N/A",
      group_name: data.groupName || "N/A",
      approval_date: new Date().toLocaleString('en-IN'),
      approved_by: data.approvedBy || "Admin",
      level1_status: data.level1Status || "N/A",
      level1_by: data.level1By || "N/A",
      level1_at: data.level1At || "N/A",
      level2_status: "Approved",
      level2_by: data.approvedBy || "Admin",
      level2_at: new Date().toLocaleString('en-IN'),
      developer_name: data.builderName || "N/A",
      location: data.location || "N/A",
      development_type: data.developmentType || "N/A",
      total_units: data.totalUnitsBlocks || "N/A",
      remark: data.remark || "N/A",
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.level2ApprovalTemplateId,
      templateParams
    );

    return {
      success: true,
      message: "Level 2 approval email sent successfully",
      response,
    };
  } catch (error) {
    console.error("EmailJS Error (Level 2 Approval):", error);
    return {
      success: false,
      message: error.text || "Failed to send approval notification",
      error,
    };
  }
};

/**
 * Validate EmailJS configuration
 * @returns {boolean} - True if all required config is present
 */
export const validateEmailConfig = () => {
  const required = [
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.form1TemplateId,
    EMAILJS_CONFIG.form2TemplateId,
    EMAILJS_CONFIG.level2ApprovalTemplateId,
    EMAILJS_CONFIG.publicKey,
  ];

  const isValid = required.every(config => config && config !== 'undefined');
  
  if (!isValid) {
    console.warn("EmailJS configuration is incomplete. Please check your .env file.");
  }
  
  return isValid;
};
