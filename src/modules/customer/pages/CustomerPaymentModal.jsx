import React from 'react';
import CustomerPaymentPage from './CustomerPaymentPage';

const CustomerPaymentModal = ({ scheduleId, isOpen, onClose }) => {
  if (!isOpen) return null;

  return <CustomerPaymentPage scheduleId={scheduleId} onClose={onClose} />;
};

export default CustomerPaymentModal;
