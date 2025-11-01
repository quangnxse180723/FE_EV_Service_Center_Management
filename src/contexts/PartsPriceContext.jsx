import React, { createContext, useContext, useState } from 'react';

const PartsPriceContext = createContext();

export function usePartsPriceContext() {
  const context = useContext(PartsPriceContext);
  if (!context) {
    throw new Error('usePartsPriceContext must be used within PartsPriceProvider');
  }
  return context;
}

export function PartsPriceProvider({ children }) {
  // State để lưu danh sách phụ tùng từ technician
  const [proposedParts, setProposedParts] = useState([]);
  // State để biết có phải là mode đề xuất (từ thông báo) hay không
  const [isProposalMode, setIsProposalMode] = useState(false);
  // Notification ID liên quan
  const [notificationId, setNotificationId] = useState(null);

  const setProposalParts = (parts, notifId) => {
    setProposedParts(parts);
    setNotificationId(notifId);
    setIsProposalMode(true);
  };

  const clearProposal = () => {
    setProposedParts([]);
    setNotificationId(null);
    setIsProposalMode(false);
  };

  const updateProposedPart = (partId, updates) => {
    setProposedParts(prev => 
      prev.map(part => part.id === partId ? { ...part, ...updates } : part)
    );
  };

  const removeProposedPart = (partId) => {
    setProposedParts(prev => prev.filter(part => part.id !== partId));
  };

  const addProposedPart = (part) => {
    setProposedParts(prev => [...prev, part]);
  };

  return (
    <PartsPriceContext.Provider
      value={{
        proposedParts,
        isProposalMode,
        notificationId,
        setProposalParts,
        clearProposal,
        updateProposedPart,
        removeProposedPart,
        addProposedPart,
      }}
    >
      {children}
    </PartsPriceContext.Provider>
  );
}
