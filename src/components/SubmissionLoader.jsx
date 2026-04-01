import React from 'react';

const SubmissionLoader = ({ isVisible, isEditing }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px 50px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        maxWidth: '450px',
        animation: 'fadeIn 0.3s ease-in',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '5px solid #e3f2fd',
          borderTop: '5px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 24px',
        }} />
        <h3 style={{
          margin: '0 0 12px',
          color: '#1976d2',
          fontSize: '20px',
          fontWeight: '700',
        }}>
          {isEditing ? 'Updating Form Data' : 'Submitting Form Data'}
        </h3>
        <p style={{
          margin: 0,
          color: '#666',
          fontSize: '15px',
          lineHeight: '1.5',
        }}>
          {isEditing 
            ? 'Please wait while we update your information...' 
            : 'Please wait while we save your information to the database...'}
        </p>
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.32s',
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.16s',
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out both',
          }} />
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SubmissionLoader;
