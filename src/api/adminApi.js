import axiosClient from './axiosClient.js';

/**
 * Admin API helpers for frontend
 * Backend controller exposes endpoints under /api/admin
 * Note: `axiosClient` response interceptor already returns `response.data`,
 * so these functions return the backend payload directly.
 */

// Customers
export const getAllCustomers = async () => {
	try {
		return await axiosClient.get('/admin/customers');
	} catch (err) {
		console.error('getAllCustomers error', err);
		throw err;
	}
};

export const createCustomer = async (customer) => {
	try {
		return await axiosClient.post('/admin/customers', customer);
	} catch (err) {
		console.error('createCustomer error', err);
		throw err;
	}
};

export const updateCustomer = async (id, customer) => {
	try {
		return await axiosClient.put(`/admin/customers/${id}`, customer);
	} catch (err) {
		console.error('updateCustomer error', err);
		throw err;
	}
};

export const deleteCustomer = async (id) => {
	try {
		return await axiosClient.delete(`/admin/customers/${id}`);
	} catch (err) {
		console.error('deleteCustomer error', err);
		throw err;
	}
};

// Technicians
export const getAllTechnicians = async () => {
	try {
		return await axiosClient.get('/admin/technicians');
	} catch (err) {
		console.error('getAllTechnicians error', err);
		throw err;
	}
};

export const createTechnician = async (technician) => {
	try {
		return await axiosClient.post('/admin/technicians', technician);
	} catch (err) {
		console.error('createTechnician error', err);
		throw err;
	}
};

export const updateTechnician = async (id, technician) => {
	try {
		return await axiosClient.put(`/admin/technicians/${id}`, technician);
	} catch (err) {
		console.error('updateTechnician error', err);
		throw err;
	}
};

export const deleteTechnician = async (id) => {
	try {
		return await axiosClient.delete(`/admin/technicians/${id}`);
	} catch (err) {
		console.error('deleteTechnician error', err);
		throw err;
	}
};

// Vehicles
export const getAllVehicles = async () => {
	try {
		return await axiosClient.get('/admin/vehicles');
	} catch (err) {
		console.error('getAllVehicles error', err);
		throw err;
	}
};

export const createVehicle = async (vehicle) => {
	try {
		return await axiosClient.post('/admin/vehicles', vehicle);
	} catch (err) {
		console.error('createVehicle error', err);
		throw err;
	}
};

export const updateVehicle = async (id, vehicle) => {
	try {
		return await axiosClient.put(`/admin/vehicles/${id}`, vehicle);
	} catch (err) {
		console.error('updateVehicle error', err);
		throw err;
	}
};

export const deleteVehicle = async (id) => {
	try {
		return await axiosClient.delete(`/admin/vehicles/${id}`);
	} catch (err) {
		console.error('deleteVehicle error', err);
		throw err;
	}
};

// Note: default export is declared at the end of the file so all helpers are initialized first

// Staff (employees) CRUD - backend exposes /api/admin/staffs
export const getAllStaffs = async () => {
	try {
		return await axiosClient.get('/admin/staffs');
	} catch (err) {
		console.error('getAllStaffs error', err);
		throw err;
	}
};

export const createStaff = async (staff) => {
	try {
		return await axiosClient.post('/admin/staffs', staff);
	} catch (err) {
		console.error('createStaff error', err);
		throw err;
	}
};

export const updateStaff = async (id, staff) => {
	try {
		return await axiosClient.put(`/admin/staffs/${id}`, staff);
	} catch (err) {
		console.error('updateStaff error', err);
		throw err;
	}
};

export const deleteStaff = async (id) => {
	try {
		return await axiosClient.delete(`/admin/staffs/${id}`);
	} catch (err) {
		console.error('deleteStaff error', err);
		throw err;
	}
};

// default export with all helpers
export default {
	getAllCustomers,
	createCustomer,
	updateCustomer,
	deleteCustomer,
	getAllTechnicians,
	createTechnician,
	updateTechnician,
	deleteTechnician,
	getAllVehicles,
	createVehicle,
	updateVehicle,
	deleteVehicle,
	getAllStaffs,
	createStaff,
	updateStaff,
	deleteStaff
};