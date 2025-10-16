// src/components/layout/Navbar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext"; // điều chỉnh path theo dự án

export default function Navbar() {
  const { user } = useAuth(); // ví dụ: { role: 'technician' | 'admin' | ... }

  return (
    <header className="nav">
      <nav className="nav-links">
        <NavLink to="/" className="nav-link">Trang chủ</NavLink>
        {/* ...các link khác... */}

        {/* Hiện link Technician nếu user là kỹ thuật viên hoặc admin cần vào */}
        {(user?.role === "technician" || user?.role === "admin") && (
          <NavLink to="/technician" className="nav-link">
            Kỹ thuật viên
          </NavLink>
        )}
      </nav>
    </header>
  );
}

