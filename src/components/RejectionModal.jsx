import React, { useState } from 'react';
import '../css/RejectionModal.css';

const RejectionModal = ({ isOpen, onConfirm, onCancel, level }) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmedRemarks = remarks.trim();
    
    if (!trimmedRemarks) {
      setError('Remarks cannot be empty');
      return;
    }
    
    if (trimmedRemarks.length < 10) {
      setError('Remarks must be at least 10 characters long');
      return;
    }
    
    onConfirm(trimmedRemarks);
    setRemarks('');
    setError('');
  };

  const handleCancel = () => {
    setRemarks('');
    setError('');
    onCancel();
  };

  return (
    <div className="rejection-modal-overlay">
      <div className="rejection-modal">
        <h2>Reject Level {level} Approval</h2>
        <p>Please provide a reason for rejection:</p>
        
        <textarea
          className="rejection-textarea"
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            setError('');
          }}
          placeholder="Enter rejection remarks (minimum 10 characters)"
          rows="5"
        />
        
        {error && <div className="rejection-error">{error}</div>}
        
        <div className="rejection-modal-buttons">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
