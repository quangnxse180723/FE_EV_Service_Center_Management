import axiosClient from './axiosClient';

const partApi = {
  // Lấy tất cả parts
  getAllParts: async () => {
    try {
      return await axiosClient.get('/parts');
    } catch (err) {
      // Nếu backend dùng /admin/parts (đôi khi API được nhóm dưới /admin), thử fallback
      const status = err?.response?.status;
      console.warn('[partApi] getAllParts failed:', status, err?.message);
      if (err.response && (status === 404 || status === 405)) {
        console.warn('[partApi] Falling back to /admin/parts');
        return await axiosClient.get('/admin/parts');
      }
      throw err;
    }
  },

  // Lấy part theo ID
  getPartById: async (partId) => {
    try {
      return await axiosClient.get(`/parts/${partId}`);
    } catch (err) {
      const status = err?.response?.status;
      console.warn('[partApi] getPartById failed for', partId, status, err?.message);
      if (err.response && (status === 404 || status === 405)) {
        console.warn('[partApi] Falling back to /admin/parts/' + partId);
        return await axiosClient.get(`/admin/parts/${partId}`);
      }
      throw err;
    }
  },

  // Lấy danh sách packagechecklistitem (itemName và giá nhân công)
  getAllPackageChecklistItems: () => {
    return axiosClient.get('/package-checklist-items');
  },

  // Lấy packagechecklistitem theo ID
  getPackageChecklistItemById: (itemId) => {
    return axiosClient.get(`/package-checklist-items/${itemId}`);
  },

  // Lấy bảng giá đầy đủ (kết hợp packagechecklistitem và part)
  getPriceList: () => {
    return axiosClient.get('/price-list');
  },

  // Tạo phụ tùng mới
  createPart: async (part) => {
    // map frontend `unitPrice` -> backend `price` (safe transform)
    const payload = { ...part };
    // Nếu không có centerId từ frontend, gán mặc định 1 (option C - quick fallback)
    if (payload.centerId === undefined || payload.centerId === null) {
      console.warn('[partApi] createPart: centerId missing in payload, defaulting to 1');
      payload.centerId = 1;
    }
    if (payload.unitPrice !== undefined) {
      payload.price = payload.unitPrice;
      delete payload.unitPrice;
    }

    // Ensure compatibility: also include nested `serviceCenter` object when possible
    // Some backend controllers expect a nested object like { serviceCenter: { id: <num> } }
    if ((payload.centerId !== undefined && payload.centerId !== null) && !payload.serviceCenter) {
      payload.serviceCenter = { id: payload.centerId };
    }

    // Debug: log outgoing payload so we can confirm what is sent to backend
    console.debug('[partApi] POST /parts payload ->', payload);

    try {
      return await axiosClient.post('/parts', payload);
    } catch (err) {
      const status = err?.response?.status;
      console.warn('[partApi] createPart failed:', status, err?.message, payload);
      if (err.response && (status === 404 || status === 405)) {
        console.warn('[partApi] Falling back to POST /admin/parts', payload);
        return await axiosClient.post('/admin/parts', payload);
      }
      throw err;
    }
  },

  // Cập nhật phụ tùng
  updatePart: async (partId, part) => {
    const payload = { ...part };
    // Nếu không có centerId từ frontend, gán mặc định 1 (option C - quick fallback)
    if (payload.centerId === undefined || payload.centerId === null) {
      console.warn('[partApi] updatePart: centerId missing in payload, defaulting to 1');
      payload.centerId = 1;
    }
    if (payload.unitPrice !== undefined) {
      payload.price = payload.unitPrice;
      delete payload.unitPrice;
    }

    // Ensure compatibility: also include nested `serviceCenter` object when possible
    if ((payload.centerId !== undefined && payload.centerId !== null) && !payload.serviceCenter) {
      payload.serviceCenter = { id: payload.centerId };
    }

    // Debug: log outgoing payload so we can confirm what is sent to backend
    console.debug(`[partApi] PUT /parts/${partId} payload ->`, payload);

    try {
      return await axiosClient.put(`/parts/${partId}`, payload);
    } catch (err) {
      const status = err?.response?.status;
      console.warn('[partApi] updatePart failed for', partId, status, err?.message, payload);
      if (err.response && (status === 404 || status === 405)) {
        console.warn('[partApi] Falling back to PUT /admin/parts/' + partId, payload);
        return await axiosClient.put(`/admin/parts/${partId}`, payload);
      }
      throw err;
    }
  },

  // Xóa phụ tùng
  deletePart: async (partId) => {
    try {
      return await axiosClient.delete(`/parts/${partId}`);
    } catch (err) {
      const status = err?.response?.status;
      console.warn('[partApi] deletePart failed for', partId, status, err?.message);
      if (err.response && (status === 404 || status === 405)) {
        console.warn('[partApi] Falling back to DELETE /admin/parts/' + partId);
        return await axiosClient.delete(`/admin/parts/${partId}`);
      }
      throw err;
    }
  },
};

export default partApi;
