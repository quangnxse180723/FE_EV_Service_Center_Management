import axios from "axios";

// Use relative '/api' base so Vite dev server proxy can forward requests to backend.
// You can override with VITE_API_BASE_URL in .env for direct backend calls.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

// Request interceptor - Tự động thêm token vào header
axiosClient.interceptors.request.use(
    (config) => {
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

// Response interceptor - Xử lý lỗi chung
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ trả về data, bỏ đi các metadata khác
        return response.data;
    },
    (error) => {
        // Nếu token hết hạn hoặc không hợp lệ (401), redirect về login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('role');
            
            // Chỉ redirect nếu không phải trang login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
