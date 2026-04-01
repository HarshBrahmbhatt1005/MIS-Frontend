import React from 'react';
import '../css/ChangesModal.css';

const ChangesModal = ({ isOpen, onClose, changes }) => {
  if (!isOpen) return null;

  return (
    <div className="changes-modal-overlay">
      <div className="changes-modal">
        <div className="changes-modal-header">
          <h2>Application Updates Detected</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="changes-modal-body">
          {Object.keys(changes).length === 0 ? (
            <div className="empty-changes">
              <p>No changes detected at this time.</p>
            </div>
          ) : (
            <div className="changes-list">
              {Object.entries(changes).map(([field, { oldVal, newVal }]) => (
                <div key={field} className="change-item">
                  <div className="change-label">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="val-box">
                    <span className="val-tag old">Was</span>
                    <div className="val-content old">{oldVal || '(Empty)'}</div>
                  </div>
                  <div className="val-box">
                    <span className="val-tag new">Is Now</span>
                    <div className="val-content new">{newVal || '(Empty)'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="changes-modal-footer">
          <button className="btn-close" onClick={onClose}>Understood</button>
        </div>
      </div>
    </div>
  );
};

export default ChangesModal;
