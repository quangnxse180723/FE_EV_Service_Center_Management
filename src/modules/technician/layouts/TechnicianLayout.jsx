import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function TechnicianLayout() {
  const navigate = useNavigate();
  const techName = localStorage.getItem("tech_name") || "Tên kỹ thuật viên";
  const techRole = localStorage.getItem("tech_role") || "Technician";

  return (
    <div className="t-frame">
      <aside className="t-side">
        <div className="t-logo">
          <div className="t-logo-fallback">
            <span className="tool">⚡</span>
            <span className="brand">VOLTFIX</span>
          </div>
        </div>

        <nav className="t-menu">
          <MenuItem to="/technician" end icon="▦" label="Dashboard" />
          <MenuItem to="/technician/assigned-jobs" icon="🛵" label="Xe được phân công" />
          <MenuItem to="#" icon="🗓️" label="Phiếu dịch vụ" disabled />
          <MenuItem to="/technician/inspection" icon="✅" label="Biên bản kiểm tra" />
          <MenuItem to="#" icon="🔧" label="Danh sách bảo dưỡng" disabled />
          <MenuItem to="#" icon="🎓" label="Quản lý chứng chỉ" disabled />
        </nav>

        <div className="t-logout-wrap">
          <button className="t-logout" onClick={() => navigate("/")}>Đăng xuất</button>
        </div>
      </aside>

      <section className="t-main">
        <header className="t-head">
          <div className="t-user">
            <div className="t-avatar">👨‍🔧</div>
            <div className="t-name">{techName}</div>
            <span className="t-badge">{techRole}</span>
          </div>
          <button className="t-bell" title="Thông báo">🔔</button>
        </header>
        <div className="t-content">
          <Outlet />
        </div>
      </section>

      <style>{`
        :root {
          --bg:#f3f4f6; --panel:#fff; --text:#111827; --muted:#6b7280;
          --side:#0b1220; --side-active:#0e1a31; --border:#d1d5db; --danger:#ef4444;
        }
        .t-frame{display:flex;min-height:100vh;background:var(--bg);color:var(--text);}
        .t-side{width:260px;background:var(--side);color:#fff;display:flex;flex-direction:column;border-right:6px solid #0ea5e9}
        .t-logo{padding:16px;border-bottom:1px solid rgba(255,255,255,.08)}
        .t-logo-fallback{display:flex;align-items:center;gap:8px;font-weight:800}
        .t-logo-fallback .brand{letter-spacing:.5px;color:#8be5ff}
        .t-menu{padding:10px;display:flex;flex-direction:column;gap:6px}
        .t-mi{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:#e5e7eb;text-decoration:none;font-weight:600}
        .t-mi:hover{background:var(--side-active)} .t-mi.active{background:#1f2937;color:#fff}
        .t-mi.disabled{opacity:.4;cursor:not-allowed} .t-mi .ic{width:24px;text-align:center}
        .t-logout-wrap{margin-top:auto;padding:12px}
        .t-logout{width:100%;background:var(--danger);color:#fff;border:none;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer}
        .t-main{flex:1;display:flex;flex-direction:column}
        .t-head{height:64px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 20px}
        .t-user{display:flex;align-items:center;gap:10px}.t-avatar{width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:#e5e7eb}
        .t-name{font-weight:800}.t-badge{background:#22c55e;color:#083c15;font-weight:800;padding:2px 8px;border-radius:6px}
        .t-bell{width:36px;height:36px;border-radius:999px;border:1px solid var(--border);background:#fff;cursor:pointer}
        .t-content{padding:20px}
      `}</style>
    </div>
  );
}

function MenuItem({ to, icon, label, end, disabled }) {
  if (disabled) {
    return <div className="t-mi disabled"><span className="ic">{icon}</span><span>{label}</span></div>;
  }
  return (
    <NavLink to={to} end={end} className={({isActive})=>`t-mi ${isActive?'active':''}`}>
      <span className="ic">{icon}</span><span>{label}</span>
    </NavLink>
  );
}
