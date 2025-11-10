# 📖 HƯỚNG DẪN GỌI API ADMIN - FRONTEND

## 📍 **VỊ TRÍ CÁC API ĐƯỢC GỌI**

---

## 1️⃣ **UserManagementPage.jsx** - Quản lý Tài khoản
📁 `src/modules/admin/pages/UserManagementPage.jsx`

### 🔄 **API GET - Lấy danh sách**
**📍 Vị trí:** Trong `useEffect()` - Dòng ~29-48

```javascript
// 🔄 API GET: Tải dữ liệu khi component mount lần đầu
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 📞 Gọi 3 API GET cùng lúc để lấy danh sách
      const [customersData, techniciansData, staffsData] = await Promise.all([
        getAllCustomers(),    // 👉 GET /api/admin/customers
        getAllTechnicians(),  // 👉 GET /api/admin/technicians
        getAllStaffs()        // 👉 GET /api/admin/staffs
      ]);
      
      // 💾 Lưu vào state
      setCustomers(customersData);
      setTechnicians(techniciansData);
      setEmployees(Array.isArray(staffsData) ? staffsData : []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

**✅ Giải thích:**
- Chạy 1 lần khi trang load
- Gọi đồng thời 3 API để tăng tốc độ
- Lưu kết quả vào state để hiển thị lên bảng

---

### 🗑️ **API DELETE - Xóa tài khoản**
**📍 Vị trí:** Trong `handleDelete()` - Dòng ~75-108

```javascript
// 🗑️ API DELETE: Xóa tài khoản
const handleDelete = async (id) => {
  if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
    try {
      if (activeTab === 'customers') {
        // 📞 DELETE /api/admin/customers/{id}
        await deleteCustomer(id);
        // 💾 Cập nhật state
        setCustomers(customers.filter(cust => cust.customerId !== id));
        
      } else if (activeTab === 'technicians') {
        // 📞 DELETE /api/admin/technicians/{id}
        await deleteTechnician(id);
        // 💾 Cập nhật state
        setTechnicians(technicians.filter(tech => tech.technicianId !== id));
        
      } else if (activeTab === 'employees') {
        // 📞 DELETE /api/admin/staffs/{id}
        await deleteStaff(id);
        // 💾 Cập nhật state
        setEmployees(employees.filter(emp => emp.staffId !== id));
      }
      
      alert('Đã xóa tài khoản!');
    } catch (err) {
      alert('Lỗi khi xóa tài khoản');
      console.error('Error deleting:', err);
    }
  }
};
```

**✅ Giải thích:**
- Được gọi khi user click nút "Xóa"
- Xác nhận trước khi xóa
- Xóa khỏi backend, sau đó cập nhật state để UI tự động refresh

---

### ✏️➕ **API CREATE & UPDATE - Thêm/Sửa tài khoản**
**📍 Vị trí:** Trong `handleSave()` - Dòng ~135-177

```javascript
// ✏️➕ API CREATE & UPDATE: Lưu dữ liệu (Thêm mới hoặc Cập nhật)
const handleSave = async () => {
  try {
    if (activeTab === 'customers') {
      if (editingItem) {
        // 📞 PUT /api/admin/customers/{id} - Cập nhật
        const updated = await updateCustomer(editingItem.customerId, formData);
        // 💾 Cập nhật state
        setCustomers(customers.map(c => 
          c.customerId === editingItem.customerId ? updated : c
        ));
      } else {
        // 📞 POST /api/admin/customers - Tạo mới
        const created = await createCustomer(formData);
        // 💾 Thêm vào state
        setCustomers([...customers, created]);
      }
    } 
    
    else if (activeTab === 'technicians') {
      if (editingItem) {
        // 📞 PUT /api/admin/technicians/{id} - Cập nhật
        const updated = await updateTechnician(editingItem.technicianId, formData);
        setTechnicians(technicians.map(t => 
          t.technicianId === editingItem.technicianId ? updated : t
        ));
      } else {
        // 📞 POST /api/admin/technicians - Tạo mới
        const created = await createTechnician(formData);
        setTechnicians([...technicians, created]);
      }
    } 
    
    else if (activeTab === 'employees') {
      if (editingItem) {
        // 📞 PUT /api/admin/staffs/{id} - Cập nhật
        const updated = await updateStaff(editingItem.staffId, formData);
        setEmployees(employees.map(e => 
          e.staffId === editingItem.staffId ? updated : e
        ));
      } else {
        // 📞 POST /api/admin/staffs - Tạo mới
        const created = await createStaff(formData);
        setEmployees([...employees, created]);
      }
    }
    
    setIsModalOpen(false);
  } catch (err) {
    console.error('Error saving item', err);
    alert('Lưu thất bại');
  }
};
```

**✅ Giải thích:**
- Được gọi khi user click nút "Lưu" trong Modal
- Kiểm tra `editingItem`:
  - Nếu có → Gọi API UPDATE (PUT)
  - Nếu null → Gọi API CREATE (POST)
- Sau khi lưu thành công, đóng modal và cập nhật state

---

## 2️⃣ **VehicleManagementPage.jsx** - Quản lý Xe
📁 `src/modules/admin/pages/VehicleManagementPage.jsx`

### 🔄 **API GET - Lấy danh sách xe**
**📍 Vị trí:** Trong `useEffect()` - Dòng ~78-150

```javascript
// 🔄 API GET: Tải dữ liệu xe khi component mount lần đầu
useEffect(() => {
  const fetchVehiclesAndOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      // 📞 Gọi 2 API GET cùng lúc
      const [vehiclesData, customersData] = await Promise.all([
        getAllVehicles(),     // 👉 GET /api/admin/vehicles
        getAllCustomers()     // 👉 GET /api/admin/customers (để lấy tên chủ xe)
          .catch((e) => {
            console.warn('getAllCustomers failed', e);
            return [];
          })
      ]);

      // Kết hợp dữ liệu xe với thông tin chủ xe
      const enriched = (vehiclesData || []).map((v) => {
        const cust = customersData.find(c => c.id === v.customerId);
        return {
          ...v,
          owner: v.owner || cust?.name,
          phone: v.phone || cust?.phone,
        };
      });

      // 💾 Lưu vào state
      setVehicles(enriched);
    } catch (err) {
      setError('Failed to fetch vehicles');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchVehiclesAndOwners();
}, []);
```

**✅ Giải thích:**
- Gọi API lấy danh sách xe
- Đồng thời lấy danh sách customer để hiển thị tên chủ xe
- Kết hợp 2 dữ liệu lại để hiển thị đầy đủ thông tin

---

### 🗑️ **API DELETE - Xóa xe**
**📍 Vị trí:** Trong `handleDelete()` - Dòng ~200-210

```javascript
// 🗑️ API DELETE: Xóa xe theo ID
const handleDelete = async (id) => {
  if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
    try {
      // 📞 DELETE /api/admin/vehicles/{id}
      await deleteVehicle(id);
      // 💾 Cập nhật state
      setVehicles(vehicles.filter(vehicle => vehicle.vehicleId !== id));
      alert('Đã xóa xe!');
    } catch (err) {
      alert('Lỗi khi xóa xe');
      console.error('Error deleting vehicle:', err);
    }
  }
};
```

**✅ Giải thích:**
- Click nút "Xóa" → Hiển thị confirm
- Gọi API xóa → Cập nhật state

---

### ✏️➕ **API CREATE & UPDATE - Thêm/Sửa xe**
**📍 Vị trí:** Trong `handleSave()` - Dòng ~219-235

```javascript
// ✏️➕ API CREATE & UPDATE: Lưu dữ liệu xe (Thêm mới hoặc Cập nhật)
const handleSave = async () => {
  try {
    if (editingItem) {
      // 📞 PUT /api/admin/vehicles/{id} - Cập nhật
      const updated = await updateVehicle(editingItem.vehicleId, formData);
      // 💾 Cập nhật state
      setVehicles(vehicles.map(v => 
        v.vehicleId === editingItem.vehicleId ? updated : v
      ));
    } else {
      // 📞 POST /api/admin/vehicles - Tạo mới
      const created = await createVehicle(formData);
      // 💾 Thêm vào state
      setVehicles([...vehicles, created]);
    }
    setIsModalOpen(false);
  } catch (err) {
    console.error('Error saving vehicle', err);
    alert('Lưu thất bại');
  }
};
```

**✅ Giải thích:**
- Modal "Thêm/Sửa xe" → Click "Lưu"
- Nếu đang sửa → Gọi UPDATE
- Nếu thêm mới → Gọi CREATE

---

## 📊 **TỔNG KẾT CÁC API**

| **Trang** | **Chức năng** | **API Endpoint** | **Method** | **Hàm gọi** | **Vị trí** |
|-----------|---------------|------------------|------------|-------------|------------|
| **UserManagement** | Lấy danh sách KH | `/api/admin/customers` | GET | `getAllCustomers()` | `useEffect()` |
| | Tạo KH mới | `/api/admin/customers` | POST | `createCustomer()` | `handleSave()` |
| | Cập nhật KH | `/api/admin/customers/{id}` | PUT | `updateCustomer()` | `handleSave()` |
| | Xóa KH | `/api/admin/customers/{id}` | DELETE | `deleteCustomer()` | `handleDelete()` |
| | Lấy danh sách KTV | `/api/admin/technicians` | GET | `getAllTechnicians()` | `useEffect()` |
| | Tạo KTV mới | `/api/admin/technicians` | POST | `createTechnician()` | `handleSave()` |
| | Cập nhật KTV | `/api/admin/technicians/{id}` | PUT | `updateTechnician()` | `handleSave()` |
| | Xóa KTV | `/api/admin/technicians/{id}` | DELETE | `deleteTechnician()` | `handleDelete()` |
| | Lấy danh sách NV | `/api/admin/staffs` | GET | `getAllStaffs()` | `useEffect()` |
| | Tạo NV mới | `/api/admin/staffs` | POST | `createStaff()` | `handleSave()` |
| | Cập nhật NV | `/api/admin/staffs/{id}` | PUT | `updateStaff()` | `handleSave()` |
| | Xóa NV | `/api/admin/staffs/{id}` | DELETE | `deleteStaff()` | `handleDelete()` |
| **VehicleManagement** | Lấy danh sách Xe | `/api/admin/vehicles` | GET | `getAllVehicles()` | `useEffect()` |
| | Tạo Xe mới | `/api/admin/vehicles` | POST | `createVehicle()` | `handleSave()` |
| | Cập nhật Xe | `/api/admin/vehicles/{id}` | PUT | `updateVehicle()` | `handleSave()` |
| | Xóa Xe | `/api/admin/vehicles/{id}` | DELETE | `deleteVehicle()` | `handleDelete()` |

---

## 🎯 **LUỒNG HOẠT ĐỘNG**

### **1. Khi trang load (Mount)**
```
Component Mount 
   ↓
useEffect() chạy
   ↓
Gọi API GET (getAllXXX)
   ↓
Nhận data từ backend
   ↓
Lưu vào state (setCustomers, setVehicles...)
   ↓
UI tự động render hiển thị data
```

### **2. Khi user click "Thêm"**
```
Click nút "Thêm"
   ↓
handleAdd() → Mở Modal với form trống
   ↓
User nhập thông tin
   ↓
Click "Lưu" → handleSave()
   ↓
Gọi API POST (createXXX)
   ↓
Backend trả về data đã tạo
   ↓
Thêm vào state
   ↓
UI tự động hiển thị item mới
```

### **3. Khi user click "Sửa"**
```
Click nút "Sửa" trên 1 row
   ↓
handleEdit(item) → Mở Modal với data có sẵn
   ↓
User sửa thông tin
   ↓
Click "Lưu" → handleSave()
   ↓
Gọi API PUT (updateXXX)
   ↓
Backend trả về data đã cập nhật
   ↓
Thay thế item cũ trong state
   ↓
UI tự động hiển thị data mới
```

### **4. Khi user click "Xóa"**
```
Click nút "Xóa" trên 1 row
   ↓
handleDelete(id) → Hiển thị confirm
   ↓
User xác nhận
   ↓
Gọi API DELETE (deleteXXX)
   ↓
Backend xóa và trả về success
   ↓
Loại bỏ item khỏi state
   ↓
UI tự động ẩn item đã xóa
```

---

## 💡 **LƯU Ý QUAN TRỌNG**

### ✅ **State Management Pattern**
```javascript
// ❌ SAI - Không nên làm
await deleteCustomer(id);
// Quên cập nhật state → UI không refresh

// ✅ ĐÚNG - Luôn cập nhật state sau khi gọi API
await deleteCustomer(id);
setCustomers(customers.filter(c => c.customerId !== id)); // UI tự động refresh
```

### ✅ **Error Handling**
```javascript
try {
  await createCustomer(formData);
  setCustomers([...customers, created]); // Chỉ chạy khi thành công
} catch (err) {
  console.error('Error:', err);
  alert('Lưu thất bại'); // Thông báo lỗi cho user
}
```

### ✅ **Loading State**
```javascript
setLoading(true);     // Hiển thị loading spinner
await getAllCustomers();
setLoading(false);    // Tắt loading spinner
```

---

## 📁 **FILE LIÊN QUAN**

```
src/
├── api/
│   └── adminApi.js              ← Định nghĩa tất cả API functions
│
├── modules/admin/pages/
│   ├── UserManagementPage.jsx   ← Gọi API: Customers, Technicians, Staffs
│   └── VehicleManagementPage.jsx ← Gọi API: Vehicles
```

---

## 🎓 **TÓM TẮT**

✅ **Tất cả 16 API đã được gọi đúng chỗ**  
✅ **Có xử lý lỗi và loading state**  
✅ **State được cập nhật đồng bộ với backend**  
✅ **UI tự động refresh sau mỗi thao tác**  

🎉 **Code đã hoàn chỉnh và sẵn sàng sử dụng!**
