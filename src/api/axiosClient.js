import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi URL này theo backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi
    if (error.response) {
      // Server trả về lỗi
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - xóa token và redirect đến login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return Promise.reject({ message: 'Không thể kết nối đến server' });
    } else {
      // Lỗi khác
      return Promise.reject({ message: error.message });
    }
  }
);

export default axiosClient;
