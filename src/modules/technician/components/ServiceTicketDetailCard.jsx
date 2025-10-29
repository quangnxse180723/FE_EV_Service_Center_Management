import React from 'react';
import './ServiceTicketDetailCard.module.css';

export default function ServiceTicketDetailCard({ ticket }){
  return (
    <div className="service-ticket-detail-card">
      <h3>{ticket?.title || 'Phiếu dịch vụ'}</h3>
      <p>ID: {ticket?.id || 'N/A'}</p>
      <p>Mô tả: {ticket?.description || '—'}</p>
    </div>
  );
}
