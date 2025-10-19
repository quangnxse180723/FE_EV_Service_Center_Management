import axiosClient from './axiosClient';

const authApi = {
  /**
   * Đăng nhập
   * POST /api/auth/login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Response với token, email, role
   */
  login: (email, password) => {
    return axiosClient.post('/auth/login', {
      email,
      password
    });
  },

  /**
   * Đăng ký tài khoản mới
   * POST /api/auth/register
   * @param {Object} accountData - Thông tin tài khoản
   * @returns {Promise}
   */
  register: (accountData) => {
    return axiosClient.post('/auth/register', accountData);
  },

  /**
   * Kiểm tra token có hợp lệ không
   * GET /api/auth/validate
   * @param {string} token - JWT token
   * @returns {Promise}
   */
  validateToken: (token) => {
    return axiosClient.get('/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * Đăng xuất - Gọi API backend và xóa localStorage
   * POST /api/auth/logout
   */
  logout: async () => {
    try {
      // Gọi API logout từ backend (nếu backend cần invalidate token)
      await axiosClient.post('/auth/logout');
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.warn('⚠️ Backend logout failed (có thể backend không cần logout API):', error.message);
      // Không throw error, vẫn xóa localStorage dù backend logout fail
    } finally {
      // Luôn xóa localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('role');
      localStorage.removeItem('accountId');
      localStorage.removeItem('email');
      console.log('🧹 Đã xóa localStorage');
    }
  }
};

export default authApi;