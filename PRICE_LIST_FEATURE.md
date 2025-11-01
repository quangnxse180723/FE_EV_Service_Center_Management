# Hướng dẫn sử dụng tính năng Bảng giá động cho Customer

## 📋 Tổng quan

Trang Bảng giá hiện hỗ trợ **2 chế độ**:

### 1️⃣ Chế độ Xem Tất Cả (Read-only)
- **Khi nào**: Customer click vào "Bảng giá" trên menu
- **Hiển thị**: 13 phụ tùng đầy đủ
- **Chức năng**: Chỉ xem, không có nút Thêm/Sửa/Xóa

### 2️⃣ Chế độ Đề Xuất (Interactive)
- **Khi nào**: Customer click vào thông báo từ Technician
- **Hiển thị**: Chỉ các phụ tùng được technician đề xuất
- **Chức năng**: 
  - ✏️ **Sửa**: Thay đổi số lượng
  - 🗑️ **Xóa**: Xóa phụ tùng không muốn
  - ➕ **Thêm**: Thêm phụ tùng khác từ danh sách 13 cái
  - ✅ **Xác nhận**: Gửi danh sách cuối cùng về technician

---

## 🧪 Test chức năng

### Cách 1: Test từ Console
Mở Console trong DevTools và chạy:

```javascript
// Giả lập thông báo từ technician với 3 phụ tùng
const testParts = [
  { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000, quantity: 2 },
  { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000, quantity: 1 },
  { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000, quantity: 1 }
];

// Set proposal mode
window.localStorage.setItem('proposalParts', JSON.stringify(testParts));
window.localStorage.setItem('isProposalMode', 'true');

// Navigate to price list
window.location.href = '/price-list';
```

### Cách 2: Tích hợp với Notification
Trong component NotificationModal hoặc tương tự, khi customer click vào notification:

```javascript
import { usePartsPriceContext } from '../contexts/PartsPriceContext';

function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const { setProposalParts } = usePartsPriceContext();
  
  const handleClick = () => {
    if (notification.type === 'PARTS_PROPOSAL') {
      // Set parts from notification
      setProposalParts(notification.proposedParts, notification.id);
      // Navigate to price list
      navigate('/price-list');
    }
  };
  
  return <div onClick={handleClick}>...</div>;
}
```

---

## 📊 Data Structure

### Proposed Part Object
```javascript
{
  id: number,              // ID phụ tùng (1-13)
  tenLinhKien: string,     // Tên phụ tùng
  giaLinhKien: number,     // Giá phụ tùng (VND)
  giaCongTho: number,      // Giá công thợ (VND)
  quantity: number         // Số lượng (mặc định 1)
}
```

---

## 🎨 UI Features

### Proposal Mode có:
1. **Banner thông báo** màu vàng: "Kỹ thuật viên đã đề xuất..."
2. **Cột Số lượng**: Hiển thị quantity
3. **Cột Tổng**: Tính (giá linh kiện + giá công thợ) × số lượng
4. **Cột Thao tác**: Nút Sửa và Xóa
5. **2 nút phía dưới**: "Thêm phụ tùng" và "Xác nhận danh sách"

### Modal:
- **AddPartModal**: Chọn từ danh sách 13 phụ tùng (trừ các phụ tùng đã có)
- **EditPartModal**: Chỉnh số lượng của phụ tùng đã chọn

---

## 🔧 API Integration (TODO)

Cần implement:
1. API để lấy danh sách parts proposal từ notification
2. API để gửi confirmed parts về backend
3. Update notification status khi customer confirm

---

## ✅ Checklist

- [x] Tạo PartsPriceContext
- [x] Cập nhật PriceListPage với 2 modes
- [x] Tạo AddPartModal
- [x] Tạo EditPartModal
- [x] Implement Delete function
- [x] Implement Confirm function
- [x] Responsive CSS
- [ ] Tích hợp với Notification system
- [ ] Kết nối API backend
- [ ] Test end-to-end workflow
