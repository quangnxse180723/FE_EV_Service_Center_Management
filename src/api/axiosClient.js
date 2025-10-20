import axios from 'axios';

// Cấu hình base URL từ environment hoặc mặc định
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tạo axios instance với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý response và error
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp
    return response.data;
  },
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - Không có quyền truy cập
          console.error('Bạn không có quyền truy cập tài nguyên này');
          break;
        case 404:
          // Not Found
          console.error('Không tìm thấy tài nguyên');
          break;
        case 500:
          // Server Error
          console.error('Lỗi server, vui lòng thử lại sau');
          break;
        default:
          console.error('Có lỗi xảy ra:', error.response.data.message);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Không thể kết nối đến server');
    } else {
      // Lỗi khác
      console.error('Lỗi:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
