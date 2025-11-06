import React, { useState } from 'react';
import CustomerPaymentPage from '../pages/CustomerPaymentPage';

const CustomerPaymentModal = ({ scheduleId, isOpen, onClose }) => {
  if (!isOpen) return null;

  return <CustomerPaymentPage scheduleId={scheduleId} onClose={onClose} />;
};

export default CustomerPaymentModal;
