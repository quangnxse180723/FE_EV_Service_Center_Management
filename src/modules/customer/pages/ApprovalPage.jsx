import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderHome from '../../../components/layout/HeaderHome';
import axiosClient from '../../../api/axiosClient';
import styles from './ApprovalPage.module.css';

export default function ApprovalPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [checklistId, setChecklistId] = useState(null);

  useEffect(() => {
    loadTicketDetail();
  }, [scheduleId]);

  const loadTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/service-ticket/${scheduleId}/detail`);
      console.log('✅ Ticket detail:', response);
      
      setTicket(response);
      setChecklistId(response.checklistId);
      
      // Map items - giữ nguyên trạng thái từ kỹ thuật viên
      const mappedItems = response.items.map(item => ({
        itemId: item.stt,
        partName: item.partName,
        actionStatus: item.actionStatus || 'Thay thế',  // Trạng thái hiện tại
        originalActionStatus: item.actionStatus || 'Thay thế',  // ✅ LƯU trạng thái gốc từ technician
        checked: true, // Mặc định: checked = đồng ý với trạng thái gốc
        partCost: item.partCost || 0,
        laborCost: item.laborCost || 0,
        // Lưu giá gốc để khôi phục khi tick lại
        originalPartCost: item.partCost || 0,
        originalLaborCost: item.laborCost || 0
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('❌ Error loading ticket:', error);
      alert('Không thể tải thông tin biên bản!');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (itemId, isChecked) => {
    setItems(items.map(item => {
      if (item.itemId === itemId) {
        if (isChecked) {
          // ✅ Tick = Restore trạng thái GỐC từ technician (TT/BT/KT)
          return {
            ...item,
            checked: true,
            actionStatus: item.originalActionStatus,  // ✅ Khôi phục trạng thái gốc
            partCost: item.originalPartCost,
            laborCost: item.originalLaborCost
          };
        } else {
          // ❌ Không tick = Chuyển sang "Kiểm tra" với giá = 0
          return {
            ...item,
            checked: false,
            actionStatus: 'Kiểm tra',  // Customer từ chối → chỉ kiểm tra
            partCost: 0,
            laborCost: 0
          };
        }
      }
      return item;
    }));
  };

  const handleApprove = async () => {
    if (!checklistId) {
      alert('Không tìm thấy ID biên bản!');
      return;
    }

    try {
      const payload = {
        items: items.map(item => ({
          itemId: item.itemId,
          actionStatus: item.actionStatus
        }))
      };

      console.log('🔵 Gửi phê duyệt:', payload);
      await axiosClient.put(`/maintenance-checklists/${checklistId}/approve`, payload);
      
      alert('✅ Đã phê duyệt biên bản kiểm tra!');
      navigate('/customer/bookings'); // Quay về lịch sử đặt lịch
    } catch (error) {
      console.error('❌ Error approving:', error);
      alert('Lỗi khi phê duyệt: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async () => {
    if (!confirm('Bạn có chắc muốn từ chối biên bản này?')) return;
    
    try {
      // TODO: Implement reject API nếu backend có
      alert('Chức năng từ chối đang được phát triển');
    } catch (error) {
      console.error('❌ Error rejecting:', error);
    }
  };

  const calculateTotal = () => {
    const totalPart = items.reduce((sum, item) => sum + item.partCost, 0);
    const totalLabor = items.reduce((sum, item) => sum + item.laborCost, 0);
    return { totalPart, totalLabor, total: totalPart + totalLabor };
  };

  if (loading) {
    return <div className={styles['loading']}>Đang tải...</div>;
  }

  if (!ticket) {
    return <div className={styles['error']}>Không tìm thấy biên bản kiểm tra!</div>;
  }

  const { totalPart, totalLabor, total } = calculateTotal();

  return (
    <div className={styles['approval-page']}>
      {/* Header */}
      <HeaderHome activeMenu="" />

      {/* Nội dung chính */}
      <div className={styles['content-wrapper']}>
        <div className={styles['page-header']}>
          <button className={styles['back-btn']} onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h1>Phê duyệt biên bản kiểm tra</h1>
        </div>

      {/* Thông tin chung */}
      <div className={styles['info-card']}>
        <h2>Thông tin xe</h2>
        <div className={styles['info-grid']}>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Tên xe:</span>
            <span className={styles['value']}>{ticket.vehicleName}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Biển số:</span>
            <span className={styles['value']}>{ticket.licensePlate}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Ngày giờ:</span>
            <span className={styles['value']}>{ticket.appointmentDateTime}</span>
          </div>
        </div>
      </div>

      {/* Bảng checklist */}
      <div className={styles['checklist-card']}>
        <h2>Danh sách hạng mục</h2>
        <p style={{color: '#666', marginBottom: '10px', fontSize: '14px'}}>
          ✓ Tick để đồng ý thay thế (tính tiền) | ✗ Bỏ tick chỉ kiểm tra (không tính tiền)
        </p>
        <table className={styles['checklist-table']}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Đồng ý</th>
              <th>Tên phụ tùng</th>
              <th>Trạng thái</th>
              <th>Giá vật tư (₫)</th>
              <th>Nhân công (₫)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.itemId}>
                <td>{index + 1}</td>
                <td style={{textAlign: 'center'}}>
                  <input 
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleCheckboxChange(item.itemId, e.target.checked)}
                    style={{width: '20px', height: '20px', cursor: 'pointer'}}
                  />
                </td>
                <td>{item.partName}</td>
                <td>
                  <span className={styles['status-badge']} 
                        style={{
                          backgroundColor: item.checked ? '#4caf50' : '#ff9800',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                    {item.actionStatus}
                  </span>
                </td>
                <td className={styles['price-cell']}>
                  {item.partCost.toLocaleString('vi-VN')}
                </td>
                <td className={styles['price-cell']}>
                  {item.laborCost.toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles['total-row']}>
              <td colSpan="4">Tổng cộng:</td>
              <td className={styles['price-cell']}>{totalPart.toLocaleString('vi-VN')}</td>
              <td className={styles['price-cell']}>{totalLabor.toLocaleString('vi-VN')}</td>
            </tr>
            <tr className={styles['grand-total-row']}>
              <td colSpan="4"><strong>TỔNG THANH TOÁN:</strong></td>
              <td colSpan="2" className={styles['grand-total']}>
                {total.toLocaleString('vi-VN')} ₫
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action buttons */}
      <div className={styles['action-buttons']}>
        <button className={styles['btn-reject']} onClick={handleReject}>
          Từ chối
        </button>
        <button className={styles['btn-approve']} onClick={handleApprove}>
          Phê duyệt
        </button>
      </div>
      </div> {/* End content-wrapper */}
    </div>
  );
}
