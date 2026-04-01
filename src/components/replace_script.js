import fs from 'fs';

const filePath = 'c:/Users/harsh/MIS-Intigration2-main/src/components/cust-login-form.jsx';
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "      <div key={app._id} className=\"card\">") {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i] === "      </div>") {
    if (lines[i+2] === "    );") {
      endIdx = i;
      break;
    }
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newCard = `      <div key={app._id} className="card">
        {/* PDF Download Button - Top Right Corner */}
        {(app.status === "Disbursed" || app.status === "Part Disbursed") && (
          <button
            onClick={() => handlePdfDownload(app._id)}
            disabled={pdfLoadingId === app._id}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              background: pdfLoadingId === app._id ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pdfLoadingId === app._id ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              zIndex: 10,
              opacity: pdfLoadingId === app._id ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (pdfLoadingId !== app._id) {
                e.target.style.background = '#c82333';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (pdfLoadingId !== app._id) {
                e.target.style.background = '#dc3545';
                e.target.style.transform = 'scale(1)';
              }
            }}
            title={pdfLoadingId === app._id ? "Generating PDF..." : "Download PDF"}
          >
            {pdfLoadingId === app._id ? (
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <FaFilePdf size={14} />
            )}
          </button>
        )}

        <div className="card-header">
          <h2 className="card-sales-name">{app.sales}</h2>
          <div className={\`status-badge \${
            app.status === "Login" ? "status-bg-gray" :
            app.status === "PD" ? "status-bg-orange" :
            app.status === "Sanction" ? "status-bg-blue" :
            app.status === "Disbursed" ? "status-bg-green" :
            app.status === "Part Disbursed" ? "status-bg-blue" :
            app.status === "Rejected" ? "status-bg-red" :
            app.status === "Withdraw" ? "status-bg-purple" :
            "status-bg-orange"
          }\`}>
            {app.status}
          </div>
        </div>

        <div className="card-body">
          <div className="card-section">
            <div className="info-row">
              <span className="info-label">Cust Name</span>
              <span className="info-value highlight-yellow">{app.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile</span>
              <span className="info-value">{maskMobile(app.mobile)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ref</span>
              <span className="info-value highlight-yellow">{app.ref}</span>
            </div>
          </div>

          <div className="card-section">
            <div className="info-row">
              <span className="info-label">Product</span>
              <span className="info-value highlight-yellow">{app.product}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Req Amount</span>
              <span className="info-value highlight-yellow">{app.amount}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Property Type</span>
              <span className="info-value">{app.propertyType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Bank</span>
              <span className="info-value highlight-yellow">{app.bank}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Banker Name</span>
              <span className="info-value">{app.bankerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Source</span>
              <span className="info-value">{app.sourceChannel === "Other" ? app.otherSourceChannel : app.sourceChannel}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Login Date</span>
              <span className="info-value">{safeFormatDate(app.loginDate)}</span>
            </div>
          </div>

          {(app.status !== "Login") && (
            <div className="card-section">
               {app.status === "Disbursed" && (
                 <div className="status-box disbursed">
                   <div className="info-row">
                      <span className="info-label">Disbursed Dt</span>
                      <span className="info-value">{safeFormatDate(app.disbursedDate)}</span>
                   </div>
                   <div className="info-row">
                      <span className="info-label">Disbursed Amt</span>
                      <span className="info-value">{app.disbursedAmount}</span>
                   </div>
                   {app.loanNumber && (
                      <div className="info-row">
                        <span className="info-label">Loan A/C No</span>
                        <span className="info-value">{app.loanNumber}</span>
                      </div>
                   )}
                 </div>
               )}

               {app.status === "Sanction" && (
                 <div className="status-box">
                    <div className="info-row">
                      <span className="info-label">Sanction Dt</span>
                      <span className="info-value">{safeFormatDate(app.sanctionDate)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Sanction Amt</span>
                      <span className="info-value">{app.sanctionAmount}</span>
                    </div>
                 </div>
               )}

               {app.status === "Part Disbursed" && lastPart && (
                 <div className="status-box part-disbursed">
                     <div className="info-row">
                        <span className="info-label">Last Part Dt</span>
                        <span className="info-value">{safeFormatDate(lastPart.date)}</span>
                     </div>
                     <div className="info-row">
                        <span className="info-label">Last Part Amt</span>
                        <span className="info-value">{formatAmount(lastPart.amount)}</span>
                     </div>
                 </div>
               )}

               {app.status === "PD" && (
                  <div className="status-box pd">
                     <div className="info-row">
                        <span className="info-label">PD Status</span>
                        <span className="info-value">{app.pdStatus || "—"}</span>
                     </div>
                     <div className="info-row">
                        <span className="info-label">PD Date</span>
                        <span className="info-value">{app.pdDate ? formatDateToIndian(app.pdDate) : "—"}</span>
                     </div>
                  </div>
               )}

               {app.status === "Re-Login" && (
                  <div className="status-box">
                    <div className="info-row">
                        <span className="info-label">Re-Login Rsn</span>
                        <span className="info-value text-danger">{app.reloginReason || "—"}</span>
                    </div>
                  </div>
               )}

               {app.status === "Rejected" && (
                  <div className="status-box rejected">
                    <div className="info-row">
                        <span className="info-label">Rejected Rmk</span>
                        <span className="info-value">{app.rejectedRemark || "—"}</span>
                    </div>
                  </div>
               )}
               {app.status === "Withdraw" && (
                  <div className="status-box withdraw">
                     <div className="info-row">
                        <span className="info-label">Withdraw Rmk</span>
                        <span className="info-value">{app.withdrawRemark || "—"}</span>
                     </div>
                  </div>
               )}
               {app.status === "Hold" && (
                  <div className="status-box hold">
                     <div className="info-row">
                        <span className="info-label">Hold Remark</span>
                        <span className="info-value">{app.holdRemark || "—"}</span>
                     </div>
                  </div>
               )}
            </div>
          )}

          <div className="card-section">
             <div className="info-row">
                <span className="info-label">Consulting</span>
                <span className="info-value">{app.consulting}</span>
             </div>
             <div className="info-row">
                <span className="info-label">PayOut</span>
                <span className="info-value highlight-yellow">{app.payout}</span>
             </div>
             <div className="info-row">
                <span className="info-label">Expense</span>
                <span className="info-value">{app.expenceAmount}</span>
             </div>
             <div className="info-row">
                <span className="info-label">Fees Refund</span>
                <span className="info-value">{app.feesRefundAmount}</span>
             </div>
             <div className="info-row">
                <span className="info-label">Remark</span>
                <span className="info-value">{app.remark}</span>
             </div>
          </div>

          {/* Admin Details Section */}
          {(app.status === "Disbursed" || app.status === "Part Disbursed") && (() => {
            const hasAdminData = !!(
              app.finalRemark ||
              app.consultingReceived ||
              app.invoiceGeneratedBy ||
              (app.payoutPercentage && app.payoutPercentage !== "") ||
              (app.subventionShortPayment && app.subventionShortPayment === "Yes") ||
              app.insurancePayout ||
              app.payoutReceived ||
              app.payoutPaid ||
              app.expensePaid ||
              app.gstReceived
            );

            return (
              <div className="card-section">
                <button
                  type="button"
                  className={\`admin-details-toggle\${expandedCards[app._id] ? " open" : ""}\`}
                  onClick={() => setExpandedCards(prev => ({ ...prev, [app._id]: !prev[app._id] }))}
                >
                  {expandedCards[app._id] ? "▲ Hide Admin Details" : "▼ Show Admin Details"}
                </button>

                 {expandedCards[app._id] && (
                  <div className="admin-details-body" style={{padding: "8px 0"}}>
                    {!hasAdminData ? (
                      <p style={{ textAlign: "center", color: "#78909c", fontStyle: "italic", margin: "8px 0" }}>
                        ⏳ No details available
                      </p>
                    ) : (
                      <>
                        {(app.consultingReceived || app.finalRemark) && (
                          <>
                            <div className="info-row"><span className="info-label" style={{color:"#0277bd", fontWeight:"800"}}>📋 Consulting</span><span className="info-value"></span></div>
                            {app.consultingReceived && (
                              <div className="info-row"><span className="info-label">Consulting Recv</span><span className="info-value">{app.consultingReceived}</span></div>
                            )}
                            {app.consultingReceived === "Yes" && app.consultingShared && (
                              <div className="info-row"><span className="info-label">Consulting Shared</span><span className="info-value">{app.consultingShared}</span></div>
                            )}
                            {app.consultingReceived === "Yes" && app.consultingRemark && (
                              <div className="info-row"><span className="info-label">Consulting Rmk</span><span className="info-value">{app.consultingRemark}</span></div>
                            )}
                            {app.finalRemark && (
                              <div className="info-row"><span className="info-label">Final Rmk (Admin)</span><span className="info-value">{app.finalRemark}</span></div>
                            )}
                          </>
                        )}

                        {(app.invoiceGeneratedBy || app.payoutPercentage || app.subventionShortPayment === "Yes") && (
                          <>
                            <div className="info-row"><span className="info-label" style={{color:"#0277bd", fontWeight:"800"}}>🧾 Inv & Payout</span><span className="info-value"></span></div>
                            {app.invoiceGeneratedBy && (
                              <div className="info-row"><span className="info-label">Invoice By</span><span className="info-value">{app.invoiceGeneratedBy === "Other" ? app.invoiceGeneratedByOther : app.invoiceGeneratedBy}</span></div>
                            )}
                            {app.payoutPercentage && (
                              <div className="info-row"><span className="info-label">Payout %</span><span className="info-value">{app.payoutPercentage}%</span></div>
                            )}
                            {app.subventionShortPayment && (
                              <div className="info-row"><span className="info-label">Subvention/Short</span><span className="info-value">{app.subventionShortPayment}</span></div>
                            )}
                            {app.subventionShortPayment === "Yes" && app.subventionRemark && (
                              <div className="info-row"><span className="info-label">Subvention Rmk</span><span className="info-value">{app.subventionRemark}</span></div>
                            )}
                          </>
                        )}

                        {(app.insurancePayout || app.payoutReceived || app.payoutPaid || app.expensePaid || app.gstReceived) && (
                          <>
                            <div className="info-row"><span className="info-label" style={{color:"#0277bd", fontWeight:"800"}}>💰 Financials</span><span className="info-value"></span></div>
                            {app.insurancePayout && (
                              <div className="info-row" style={{flexDirection:"column", alignItems:"flex-start", gap:"4px"}}>
                                <span className="info-label">Insurance Payout: ₹{Number(app.insurancePayout).toLocaleString("en-IN")}</span>
                                <span className="info-value" style={{fontSize:"13px", color:"#555"}}>{app.insurancePayoutInvoiceNumber && \`Inv: \${app.insurancePayoutInvoiceNumber}\`} {app.insurancePayoutDate && \` | Dt: \${safeFormatDate(app.insurancePayoutDate)}\`}</span>
                              </div>
                            )}
                            {app.payoutReceived && (
                              <div className="info-row" style={{flexDirection:"column", alignItems:"flex-start", gap:"4px"}}>
                                <span className="info-label">Payout Received: ₹{Number(app.payoutReceived).toLocaleString("en-IN")}</span>
                                <span className="info-value" style={{fontSize:"13px", color:"#555"}}>{app.payoutReceivedInvoiceNumber && \`Inv: \${app.payoutReceivedInvoiceNumber}\`} {app.payoutReceivedDate && \` | Dt: \${safeFormatDate(app.payoutReceivedDate)}\`}</span>
                              </div>
                            )}
                            {app.payoutPaid && (
                              <div className="info-row" style={{flexDirection:"column", alignItems:"flex-start", gap:"4px"}}>
                                <span className="info-label">Payout Paid: ₹{Number(app.payoutPaid).toLocaleString("en-IN")}</span>
                                <span className="info-value" style={{fontSize:"13px", color:"#555"}}>{app.payoutPaidInvoiceNumber && \`Inv: \${app.payoutPaidInvoiceNumber}\`} {app.payoutPaidDate && \` | Dt: \${safeFormatDate(app.payoutPaidDate)}\`}</span>
                              </div>
                            )}
                            {app.expensePaid && (
                              <div className="info-row" style={{flexDirection:"column", alignItems:"flex-start", gap:"4px"}}>
                                <span className="info-label">Expense Paid: ₹{Number(app.expensePaid).toLocaleString("en-IN")}</span>
                                <span className="info-value" style={{fontSize:"13px", color:"#555"}}>{app.expensePaidInvoiceNumber && \`Inv: \${app.expensePaidInvoiceNumber}\`} {app.expensePaidDate && \` | Dt: \${safeFormatDate(app.expensePaidDate)}\`}</span>
                              </div>
                            )}
                            {app.gstReceived && (
                              <div className="info-row" style={{flexDirection:"column", alignItems:"flex-start", gap:"4px"}}>
                                <span className="info-label">GST Received: ₹{Number(app.gstReceived).toLocaleString("en-IN")}</span>
                                <span className="info-value" style={{fontSize:"13px", color:"#555"}}>{app.gstReceivedInvoiceNumber && \`Inv: \${app.gstReceivedInvoiceNumber}\`} {app.gstReceivedDate && \` | Dt: \${safeFormatDate(app.gstReceivedDate)}\`}</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Change Tracker Bar */}
          {app.lastChanges && Object.keys(app.lastChanges).length > 0 && (
            <div className="card-change-bar" style={{ margin: "4px 0 0 0", borderRadius: "0", borderLeft: "none", borderRight: "none" }}>
              <div className="card-change-left">
                <span className="card-change-badge">
                  <span className="change-dot"></span>
                  {Object.keys(app.lastChanges).length} change{Object.keys(app.lastChanges).length !== 1 ? 's' : ''}
                </span>
                {app.lastChangedAt && (
                  <span className="card-change-time">
                    {new Date(app.lastChangedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true })}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="card-view-changes-btn"
                onClick={() => {
                  setSelectedCardChanges(app.lastChanges);
                  setIsChangesModalOpen(true);
                }}
              >
                👁 View Changes
              </button>
              <button
                type="button"
                className="card-dismiss-btn"
                title="Dismiss indicator"
                onClick={async () => {
                  try {
                    await axios.patch(\`\${API}/api/applications/\${app._id}\`, {
                      lastChanges: null,
                      lastChangedAt: null,
                    });
                    fetchApplications();
                  } catch (err) {
                    console.error('Failed to dismiss change indicator', err);
                  }
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="card-footer">
          {app.importantMsg && app.approvalStatus !== "Approved" && (
            <div className="approval-msg pending" style={{fontSize: "0.85rem", whiteSpace: "pre-wrap", textAlign: "left"}}>
              {app.importantMsg}
            </div>
          )}

          {app.approvalStatus === "Approved by SB" ? (
            <div className="approval-msg approved" style={{textAlign: "left", display:"flex", alignItems:"center", gap:"6px"}}>
              <span style={{fontSize:"16px"}}>✅</span> Approved by SB
            </div>
          ) : app.approvalStatus === "Rejected by SB" ? (
            <div className="approval-msg rejected" style={{textAlign: "left", display:"flex", alignItems:"center", gap:"6px"}}>
              <span style={{fontSize:"16px"}}>❌</span> Rejected by SB
            </div>
          ) : (
            <div className="approval-buttons" style={{marginTop:"0"}}>
              <button
                className="approve-btn"
                style={{flex: 1, padding: "10px"}}
                onClick={() => handleApprove(app._id)}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                style={{flex: 1, padding: "10px"}}
                onClick={() => handleReject(app._id)}
              >
                Reject
              </button>
            </div>
          )}

          {/* HG Approval Section (Hitendra Goswami) */}
          {(app.status === "Disbursed" || app.status === "Part Disbursed") && (
            <div style={{ marginTop: "4px" }}>
              {app.hsApprovalStatus === "Approved" ? (
                <div className="approval-msg approved" style={{textAlign: "left", display:"flex", alignItems:"center", gap:"6px"}}>
                  <span style={{fontSize:"16px"}}>✅</span> HG Approved <span style={{fontWeight:"600", fontSize:"0.8rem", marginLeft:"auto"}}>{app.hsApprovedAt ? formatDateToIndian(app.hsApprovedAt) : ""}</span>
                </div>
              ) : app.hsApprovalStatus === "Rejected" ? (
                <div className="approval-msg rejected" style={{textAlign: "left", display:"flex", alignItems:"center", gap:"6px"}}>
                  <span style={{fontSize:"16px"}}>❌</span> HG Rejected <span style={{fontWeight:"600", fontSize:"0.8rem", marginLeft:"auto"}}>{app.hsApprovedAt ? formatDateToIndian(app.hsApprovedAt) : ""}</span>
                </div>
              ) : (
                <>
                  <div className="approval-msg pending" style={{textAlign: "left", display:"flex", alignItems:"center", gap:"6px"}}>
                    <span style={{fontSize:"16px"}}>🕐</span> HG Approval Pending
                  </div>
                  <div className="approval-buttons" style={{marginTop:"8px"}}>
                    <button
                      className="approve-btn"
                      onClick={() => handleHSApprove(app._id)}
                      style={{ backgroundColor: "#4caf50", flex: 1, padding: "10px" }}
                    >
                      HG Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleHSReject(app._id)}
                      style={{ backgroundColor: "#f44336", flex: 1, padding: "10px" }}
                    >
                      HG Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{display: "flex", gap: "10px", marginTop: "4px"}}>
            {app.approvalStatus !== "Rejected by SB" && (
              <button className="edit-btn" style={{flex: 1, padding: "10px", fontSize: "15px"}} onClick={() => handleEdit(app)}>
                ✏️ Edit
              </button>
            )}
            
            {(app.status === "Disbursed" || app.status === "Part Disbursed") && (
              <button 
                className="edit-btn" 
                onClick={() => handleAccountEdit(app)}
                style={{ backgroundColor: "#FF9800", flex: 1, padding: "10px", fontSize: "15px" }}
                title="Edit account details"
              >
                💳 Acc Edit
              </button>
            )}
          </div>
        </div>
      </div>`;

  lines.splice(startIdx, endIdx - startIdx + 1, newCard);
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log("Replacement successful!");
} else {
  console.log("Could not find start/end indices: startIdx=", startIdx, " endIdx=", endIdx);
}
