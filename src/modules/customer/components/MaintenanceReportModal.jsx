import { useEffect, useState } from 'react';
import { getOrCreateChecklist } from '../../technician/services/technicianService';
import './MaintenanceReportModal.css';

export default function MaintenanceReportModal({ scheduleId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (scheduleId) {
      loadReport();
    }
  }, [scheduleId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      console.log('🔵 Loading maintenance report for scheduleId:', scheduleId);
      
      // ✅ Sử dụng hàm getOrCreateChecklist từ technicianService
      const { header, items } = await getOrCreateChecklist(scheduleId);
      console.log('✅ Loaded report:', { header, items });
      
      // ✅ Kiểm tra nếu không có items hoặc items rỗng
      if (!items || items.length === 0) {
        console.warn('⚠️ No maintenance items found for scheduleId:', scheduleId);
        setReport({ error: 'Không có hạng mục nào trong biên bản.' });
      } else {
        // ✅ Map dữ liệu sang format component (giống CustomerPaymentPage)
        setReport({
          customerName: header.owner,
          vehicleName: header.vehicle,
          licensePlate: header.license,
          appointmentDateTime: header.dateTime,
          checklistId: header.checklistId,
          items: items.map(item => ({
            itemId: item.itemId,
            partName: item.name,
            partCost: item.partCost || 0, // Giá gốc (không +10% nữa)
            laborCost: item.laborCost || 0,
            actionStatus: item.status // "Thay thế", "Kiểm tra", "Bôi trơn"
          }))
        });
      }
    } catch (error) {
      console.error('❌ Error loading report:', error);
      setReport({ error: 'Không thể tải dữ liệu biên bản. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!report?.items) return { totalPart: 0, totalLabor: 0, total: 0 };
    
    const totalPart = report.items.reduce((sum, item) => sum + (item.partCost || 0), 0);
    const totalLabor = report.items.reduce((sum, item) => sum + (item.laborCost || 0), 0);
    return { totalPart, totalLabor, total: totalPart + totalLabor };
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  // ✅ Hiển thị thông báo nếu có lỗi hoặc không có dữ liệu
  if (!report || report.error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content maintenance-report-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Biên bản sửa chữa</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="empty-state">
              <p style={{textAlign: 'center', color: '#6b7280', fontSize: '1rem', padding: '40px 20px'}}>
                {report?.error || '⚠️ Biên bản kiểm tra chưa được tạo. Vui lòng đợi kỹ thuật viên hoàn thành kiểm tra xe.'}
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-close" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    );
  }

  const { totalPart, totalLabor, total } = calculateTotal();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content maintenance-report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Biên bản sửa chữa</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Thông tin xe */}
          <div className="info-section">
            <div className="info-row">
              <span className="label">Tên xe:</span>
              <span className="value">{report.vehicleName}</span>
            </div>
            <div className="info-row">
              <span className="label">Biển số xe:</span>
              <span className="value">{report.licensePlate}</span>
            </div>
            <div className="info-row">
              <span className="label">Ngày giờ:</span>
              <span className="value">{report.appointmentDateTime}</span>
            </div>
          </div>

          {/* Bảng checklist */}
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên phụ tùng</th>
                  <th>Giá vật tư (₫)</th>
                  <th>Nhân công (₫)</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {report.items && report.items.length > 0 ? (
                  report.items.map((item, index) => {
                    // ✅ Giá vật tư gốc (không +10% nữa)
                    const partPrice = item.partCost ? item.partCost : 0;
                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{item.partName}</td>
                        <td className="text-right">{formatCurrency(partPrice)}</td>
                        <td className="text-right">{formatCurrency(item.laborCost)}</td>
                        <td>
                          <span className={`status-badge status-${item.actionStatus?.toLowerCase().replace(/\s+/g, '.')}`}>
                            {item.actionStatus || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', color: '#6b7280', padding: '20px'}}>
                      Không có hạng mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="2" className="text-right"><strong>Tổng cộng:</strong></td>
                  <td className="text-right"><strong>{formatCurrency(totalPart)}</strong></td>
                  <td colSpan="2" className="text-right"><strong>{formatCurrency(totalLabor)}</strong></td>
                </tr>
                <tr className="grand-total-row">
                  <td colSpan="4" className="text-right"><strong>TỔNG THANH TOÁN:</strong></td>
                  <td className="text-right grand-total"><strong>{formatCurrency(total)} ₫</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
