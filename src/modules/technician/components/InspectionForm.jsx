import React from 'react';
import ChecklistEditor from './ChecklistEditor';
import './InspectionForm.module.css';

export default function InspectionForm({ recordId }){
  return (
    <div className="inspection-form">
      {/* reuse existing ChecklistEditor for inspection creation */}
      <ChecklistEditor recordId={recordId} />
    </div>
  );
}
