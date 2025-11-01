import React, { useState } from 'react';
import './PartModal.css';
import { formatCurrencyVND } from '../../utils/formatCurrency';

const ALL_PARTS = [
  { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 2, tenLinhKien: 'Đèn / còi / hiển thị đồng hồ', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 3, tenLinhKien: 'Vỏ bọc, tay gas', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 4, tenLinhKien: 'Chân chống cạnh/ chân chống đứng', giaLinhKien: 150000, giaCongTho: 50000 },
  { id: 5, tenLinhKien: 'Cơ cấu khóa yên xe', giaLinhKien: 200000, giaCongTho: 60000 },
  { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000 },
  { id: 7, tenLinhKien: 'Dầu phanh', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 8, tenLinhKien: 'Phanh trước', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 9, tenLinhKien: 'Ống dầu phanh trước', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000 },
  { id: 11, tenLinhKien: 'Lốp xe trước', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 12, tenLinhKien: 'Cổ phốt', giaLinhKien: 250000, giaCongTho: 80000 },
  { id: 13, tenLinhKien: 'Giảm xóc trước', giaLinhKien: 400000, giaCongTho: 80000 },
];

export default function AddPartModal({ isOpen, onClose, onAdd, existingPartIds = [] }) {
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableParts = ALL_PARTS.filter(part => !existingPartIds.includes(part.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPartId) {
      alert('Vui lòng chọn phụ tùng');
      return;
    }
    
    const selectedPart = ALL_PARTS.find(p => p.id === parseInt(selectedPartId));
    if (selectedPart) {
      onAdd({
        ...selectedPart,
        quantity: parseInt(quantity),
      });
      setSelectedPartId('');
      setQuantity(1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="part-modal-overlay" onClick={onClose}>
      <div className="part-modal" onClick={e => e.stopPropagation()}>
        <div className="part-modal-header">
          <h2>Thêm phụ tùng</h2>
          <button className="part-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="part-modal-body">
          <div className="form-group">
            <label>Chọn phụ tùng</label>
            <select 
              value={selectedPartId} 
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="form-select"
              required
            >
              <option value="">-- Chọn phụ tùng --</option>
              {availableParts.map(part => (
                <option key={part.id} value={part.id}>
                  {part.tenLinhKien} - {formatCurrencyVND(part.giaLinhKien)} + {formatCurrencyVND(part.giaCongTho)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Số lượng</label>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="part-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Thêm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
