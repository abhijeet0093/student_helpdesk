import React from 'react';
import '../styles/Dashboard.css';

const SummaryCard = ({ title, value, icon, color = '#667eea' }) => {
  return (
    <div className="summary-card" style={{ borderLeftColor: color }}>
      <div className="summary-card-content">
        <div className="summary-card-header">
          <span className="summary-card-icon" style={{ color }}>
            {icon}
          </span>
          <h3 className="summary-card-title">{title}</h3>
        </div>
        <p className="summary-card-value">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
