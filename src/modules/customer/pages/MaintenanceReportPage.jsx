import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrCreateChecklist } from '../../technician/services/technicianService';
import HeaderHome from '../../../components/layout/HeaderHome';
import './MaintenanceReportPage.css';

export default function MaintenanceReportPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
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
      
      const { header, items } = await getOrCreateChecklist(scheduleId);
      console.log('✅ Loaded report:', { header, items });
      
      if (!items || items.length === 0) {
        console.warn('⚠️ No maintenance items found for scheduleId:', scheduleId);
        setReport({ error: 'Không có hạng mục nào trong biên bản.' });
      } else {
        setReport({
          customerName: header.owner,
          vehicleName: header.vehicle,
          licensePlate: header.license,
          appointmentDateTime: header.dateTime,
          checklistId: header.checklistId,
          items: items.map(item => ({
            itemId: item.itemId,
            partName: item.name,
            partCost: item.partCost || 0,
            laborCost: item.laborCost || 0,
            actionStatus: item.status
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
      <div className="maintenance-report-page">
        <HeaderHome activeMenu="" />
        <div className="page-content">
          <div className="loading-state">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!report || report.error) {
    return (
      <div className="maintenance-report-page">
        <HeaderHome activeMenu="" />
        <div className="page-content">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Quay lại
            </button>
            <h1>Biên bản sửa chữa</h1>
          </div>
          <div className="error-state">
            <p>{report?.error || '⚠️ Biên bản kiểm tra chưa được tạo. Vui lòng đợi kỹ thuật viên hoàn thành kiểm tra xe.'}</p>
            <button className="btn-back" onClick={() => navigate(-1)}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { totalPart, totalLabor, total } = calculateTotal();

  return (
    <div className="maintenance-report-page">
      <HeaderHome activeMenu="" />
      
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h1>Biên bản sửa chữa</h1>
        </div>

        {/* Thông tin xe */}
        <div className="info-card">
          <h2>Thông tin xe</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Khách hàng:</span>
              <span className="value">{report.customerName}</span>
            </div>
            <div className="info-item">
              <span className="label">Tên xe:</span>
              <span className="value">{report.vehicleName}</span>
            </div>
            <div className="info-item">
              <span className="label">Biển số:</span>
              <span className="value">{report.licensePlate}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngày giờ:</span>
              <span className="value">{report.appointmentDateTime}</span>
            </div>
          </div>
        </div>

        {/* Bảng checklist */}
        <div className="table-card">
          <h2>Danh sách hạng mục</h2>
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
                    const partPrice = item.partCost ? item.partCost : 0;
                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{item.partName}</td>
                        <td className="text-right">{formatCurrency(partPrice)}</td>
                        <td className="text-right">{formatCurrency(item.laborCost)}</td>
                        <td>
                          <span className={`status-badge status-${item.actionStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {item.actionStatus || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center empty-message">
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

        {/* Action buttons */}
        <div className="action-buttons">
          <button className="btn-back" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
