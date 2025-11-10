import axiosClient from './axiosClient.js';

/**
 * 📋 Admin API helpers for frontend
 * 🔗 Backend controller: AdminController.java (/api/admin)
 * 📝 Note: `axiosClient` response interceptor tự động trả về `response.data`,
 *    nên các hàm này trả về dữ liệu từ backend trực tiếp (không cần .data)
 */

// ==================== KHÁCH HÀNG (CUSTOMERS) ====================

/**
 * 📞 GET /api/admin/customers
 * 📖 Lấy danh sách tất cả khách hàng
 * 🔙 Trả về: Array<Customer>
 */
export const getAllCustomers = async () => {
	try {
		return await axiosClient.get('/admin/customers');
	} catch (err) {
		console.error('getAllCustomers error', err);
		throw err;
	}
};

/**
 * 📞 POST /api/admin/customers
 * ➕ Tạo khách hàng mới
 * 📥 Tham số: customer (object) - Thông tin khách hàng mới
 * 🔙 Trả về: Customer (đối tượng khách hàng vừa tạo)
 */
export const createCustomer = async (customer) => {
	try {
		return await axiosClient.post('/admin/customers', customer);
	} catch (err) {
		console.error('createCustomer error', err);
		throw err;
	}
};

/**
 * 📞 PUT /api/admin/customers/{id}
 * ✏️ Cập nhật thông tin khách hàng
 * 📥 Tham số: 
 *    - id: ID của khách hàng cần cập nhật
 *    - customer: Thông tin mới của khách hàng
 * 🔙 Trả về: Customer (đối tượng khách hàng sau khi cập nhật)
 */
export const updateCustomer = async (id, customer) => {
	try {
		return await axiosClient.put(`/admin/customers/${id}`, customer);
	} catch (err) {
		console.error('updateCustomer error', err);
		throw err;
	}
};

/**
 * 📞 DELETE /api/admin/customers/{id}
 * 🗑️ Xóa khách hàng theo ID
 * 📥 Tham số: id - ID của khách hàng cần xóa
 * 🔙 Trả về: void
 * ⚠️ Lưu ý: Có thể lỗi nếu khách hàng có dữ liệu liên quan (xe, lịch hẹn...)
 */
export const deleteCustomer = async (id) => {
	try {
		return await axiosClient.delete(`/admin/customers/${id}`);
	} catch (err) {
		console.error('deleteCustomer error', err);
		throw err;
	}
};

// ==================== KỸ THUẬT VIÊN (TECHNICIANS) ====================

/**
 * 📞 GET /api/admin/technicians
 * 📖 Lấy danh sách tất cả kỹ thuật viên
 * 🔙 Trả về: Array<Technician>
 */
export const getAllTechnicians = async () => {
	try {
		return await axiosClient.get('/admin/technicians');
	} catch (err) {
		console.error('getAllTechnicians error', err);
		throw err;
	}
};

/**
 * 📞 POST /api/admin/technicians
 * ➕ Tạo kỹ thuật viên mới
 * 📥 Tham số: technician (object) - Thông tin kỹ thuật viên mới
 * 🔙 Trả về: Technician (đối tượng kỹ thuật viên vừa tạo)
 */
export const createTechnician = async (technician) => {
	try {
		return await axiosClient.post('/admin/technicians', technician);
	} catch (err) {
		console.error('createTechnician error', err);
		throw err;
	}
};

/**
 * 📞 PUT /api/admin/technicians/{id}
 * ✏️ Cập nhật thông tin kỹ thuật viên
 * 📥 Tham số: 
 *    - id: ID của kỹ thuật viên cần cập nhật
 *    - technician: Thông tin mới của kỹ thuật viên
 * 🔙 Trả về: Technician (đối tượng kỹ thuật viên sau khi cập nhật)
 */
export const updateTechnician = async (id, technician) => {
	try {
		return await axiosClient.put(`/admin/technicians/${id}`, technician);
	} catch (err) {
		console.error('updateTechnician error', err);
		throw err;
	}
};

/**
 * 📞 DELETE /api/admin/technicians/{id}
 * 🗑️ Xóa kỹ thuật viên theo ID
 * 📥 Tham số: id - ID của kỹ thuật viên cần xóa
 * 🔙 Trả về: void
 * ⚠️ Lưu ý: Có thể lỗi nếu kỹ thuật viên có dữ liệu liên quan (lịch hẹn, công việc...)
 */
export const deleteTechnician = async (id) => {
	try {
		return await axiosClient.delete(`/admin/technicians/${id}`);
	} catch (err) {
		console.error('deleteTechnician error', err);
		throw err;
	}
};

// ==================== XE (VEHICLES) ====================

/**
 * 📞 GET /api/admin/vehicles
 * 📖 Lấy danh sách tất cả xe
 * 🔙 Trả về: Array<Vehicle>
 */
export const getAllVehicles = async () => {
	try {
		return await axiosClient.get('/admin/vehicles');
	} catch (err) {
		console.error('getAllVehicles error', err);
		throw err;
	}
};

/**
 * 📞 POST /api/admin/vehicles
 * ➕ Tạo xe mới
 * 📥 Tham số: vehicle (object) - Thông tin xe mới (biển số, hãng, model, năm, màu...)
 * 🔙 Trả về: Vehicle (đối tượng xe vừa tạo)
 */
export const createVehicle = async (vehicle) => {
	try {
		return await axiosClient.post('/admin/vehicles', vehicle);
	} catch (err) {
		console.error('createVehicle error', err);
		throw err;
	}
};

/**
 * 📞 PUT /api/admin/vehicles/{id}
 * ✏️ Cập nhật thông tin xe
 * 📥 Tham số: 
 *    - id: ID của xe cần cập nhật
 *    - vehicle: Thông tin mới của xe
 * 🔙 Trả về: Vehicle (đối tượng xe sau khi cập nhật)
 */
export const updateVehicle = async (id, vehicle) => {
	try {
		return await axiosClient.put(`/admin/vehicles/${id}`, vehicle);
	} catch (err) {
		console.error('updateVehicle error', err);
		throw err;
	}
};

/**
 * 📞 DELETE /api/admin/vehicles/{id}
 * 🗑️ Xóa xe theo ID
 * 📥 Tham số: id - ID của xe cần xóa
 * 🔙 Trả về: void
 * ⚠️ Lưu ý: Có thể lỗi nếu xe có dữ liệu liên quan (lịch hẹn, hóa đơn...)
 */
export const deleteVehicle = async (id) => {
	try {
		return await axiosClient.delete(`/admin/vehicles/${id}`);
	} catch (err) {
		console.error('deleteVehicle error', err);
		throw err;
	}
};

// ==================== NHÂN VIÊN (STAFF/EMPLOYEES) ====================

/**
 * 📞 GET /api/admin/staffs
 * 📖 Lấy danh sách tất cả nhân viên
 * 🔙 Trả về: Array<Staff>
 */
export const getAllStaffs = async () => {
	try {
		return await axiosClient.get('/admin/staffs');
	} catch (err) {
		console.error('getAllStaffs error', err);
		throw err;
	}
};

/**
 * 📞 POST /api/admin/staffs
 * ➕ Tạo nhân viên mới
 * 📥 Tham số: staff (object) - Thông tin nhân viên mới
 * 🔙 Trả về: Staff (đối tượng nhân viên vừa tạo)
 */
export const createStaff = async (staff) => {
	try {
		return await axiosClient.post('/admin/staffs', staff);
	} catch (err) {
		console.error('createStaff error', err);
		throw err;
	}
};

/**
 * 📞 PUT /api/admin/staffs/{id}
 * ✏️ Cập nhật thông tin nhân viên
 * 📥 Tham số: 
 *    - id: ID của nhân viên cần cập nhật
 *    - staff: Thông tin mới của nhân viên
 * 🔙 Trả về: Staff (đối tượng nhân viên sau khi cập nhật)
 */
export const updateStaff = async (id, staff) => {
	try {
		return await axiosClient.put(`/admin/staffs/${id}`, staff);
	} catch (err) {
		console.error('updateStaff error', err);
		throw err;
	}
};

/**
 * 📞 DELETE /api/admin/staffs/{id}
 * 🗑️ Xóa nhân viên theo ID
 * 📥 Tham số: id - ID của nhân viên cần xóa
 * 🔙 Trả về: void
 * ⚠️ Lưu ý: Có thể lỗi nếu nhân viên có dữ liệu liên quan
 */
export const deleteStaff = async (id) => {
	try {
		return await axiosClient.delete(`/admin/staffs/${id}`);
	} catch (err) {
		console.error('deleteStaff error', err);
		throw err;
	}
};



// ==================== PHỤ TÙNG (PARTS) ====================

/**
 * 📞 GET /api/admin/parts
 * 📖 Lấy danh sách tất cả phụ tùng
 * 🔙 Trả về: Array<Part>
 */
export const getAllParts = async () => {
	try {
		return await axiosClient.get('/admin/parts');
	} catch (err) {
		console.error('getAllParts error', err);
		throw err;
	}
};

/**
 * 📞 POST /api/admin/parts
 * ➕ Tạo phụ tùng mới
 * 📥 Tham số: part (object) - Thông tin phụ tùng mới (tên, giá, số lượng...)
 * 🔙 Trả về: Part (đối tượng phụ tùng vừa tạo)
 */
export const createPart = async (part) => {
	try {
		return await axiosClient.post('/admin/parts', part);
	} catch (err) {
		console.error('createPart error', err);
		throw err;
	}
};

/**
 * 📞 PUT /api/admin/parts/{id}
 * ✏️ Cập nhật thông tin phụ tùng
 * 📥 Tham số: 
 *    - id: ID của phụ tùng cần cập nhật
 *    - part: Thông tin mới của phụ tùng
 * 🔙 Trả về: Part (đối tượng phụ tùng sau khi cập nhật)
 */
export const updatePart = async (id, part) => {
	try {
		return await axiosClient.put(`/admin/parts/${id}`, part);
	} catch (err) {
		console.error('updatePart error', err);
		throw err;
	}
};

/**
 * 📞 DELETE /api/admin/parts/{id}
 * 🗑️ Xóa phụ tùng theo ID
 * 📥 Tham số: id - ID của phụ tùng cần xóa
 * 🔙 Trả về: void
 */
export const deletePart = async (id) => {
	try {
		return await axiosClient.delete(`/admin/parts/${id}`);
	} catch (err) {
		console.error('deletePart error', err);
		throw err;
	}
};

// ==================== DOANH THU (REVENUE) ====================

/**
 * 📞 GET /api/admin/revenue/summary
 * 📊 Lấy tóm tắt doanh thu theo khoảng thời gian
 * 📥 Tham số: 
 *    - from: Ngày bắt đầu (format: YYYY-MM-DD) - Mặc định: 1 tháng trước
 *    - to: Ngày kết thúc (format: YYYY-MM-DD) - Mặc định: hôm nay
 * 🔙 Trả về: RevenueSummary { totalRevenue, totalCost, totalProfit, ... }
 */
export const getRevenueSummary = async (from, to) => {
	try {
		const params = {};
		if (from) params.from = from;
		if (to) params.to = to;
		
		return await axiosClient.get('/admin/revenue/summary', { params });
	} catch (err) {
		console.error('getRevenueSummary error', err);
		throw err;
	}
};

/**
 * 📞 GET /api/admin/revenue/groups
 * 📈 Lấy doanh thu theo nhóm (ngày/tuần/tháng)
 * 📥 Tham số: 
 *    - from: Ngày bắt đầu (format: YYYY-MM-DD) - Mặc định: 1 tháng trước
 *    - to: Ngày kết thúc (format: YYYY-MM-DD) - Mặc định: hôm nay
 *    - groupBy: Nhóm theo ('day' | 'week' | 'month') - Mặc định: 'day'
 * 🔙 Trả về: Array<RevenueGroupDTO> { date, revenue, cost, profit, ... }
 */
export const getRevenueGroups = async (from, to, groupBy = 'day') => {
	try {
		const params = { groupBy };
		if (from) params.from = from;
		if (to) params.to = to;
		
		return await axiosClient.get('/admin/revenue/groups', { params });
	} catch (err) {
		console.error('getRevenueGroups error', err);
		throw err;
	}
};

// ==================== DEFAULT EXPORT ====================
/**
 * 📦 Export tất cả API functions dưới dạng default object
 * 💡 Có thể import theo 2 cách:
 *    - Named import: import { getAllCustomers, createCustomer } from './adminApi'
 *    - Default import: import adminApi from './adminApi' → adminApi.getAllCustomers()
 */
export default {
	// Customers - Khách hàng
	getAllCustomers,
	createCustomer,
	updateCustomer,
	deleteCustomer,
	// Technicians - Kỹ thuật viên
	getAllTechnicians,
	createTechnician,
	updateTechnician,
	deleteTechnician,
	// Vehicles - Xe
	getAllVehicles,
	createVehicle,
	updateVehicle,
	deleteVehicle,
	// Staff - Nhân viên
	getAllStaffs,
	createStaff,
	updateStaff,
	deleteStaff,
	// Parts - Phụ tùng
	getAllParts,
	createPart,
	updatePart,
	deletePart,
	// Revenue - Doanh thu
	getRevenueSummary,
	getRevenueGroups
};