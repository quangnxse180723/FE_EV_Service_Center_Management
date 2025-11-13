import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './CenterManagementPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';
import centerApi from '../../../api/centerApi';
// Thư viện bản đồ (Leaflet) - sử dụng trực tiếp Leaflet (không dùng react-leaflet)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icon marker mặc định Leaflet cần fix đường dẫn icon (sử dụng CDN)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Hàm tính khoảng cách (Haversine) giữa 2 tọa độ (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Component nhỏ để cập nhật center khi tìm vị trí người dùng
// Không dùng react-leaflet RecenterMap - sẽ quản lý map trực tiếp bằng Leaflet

export default function CenterManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [userPos, setUserPos] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '' });

  const mapRef = useRef();
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  // Lọc local realtime (phải khai báo trước khi các useEffect sử dụng)
  const filtered = centers.filter(c => {
    const q = (search || '').toLowerCase();
    return (
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  // Tọa độ trung tâm bản đồ mặc định (được dùng khi khởi tạo map)
  const defaultCenter = userPos ? [userPos.lat, userPos.lng] : (centers[0] ? [centers[0].latitude, centers[0].longitude] : [10.762622, 106.660172]);

  // Load centers từ API
  const loadCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await centerApi.getAllCenters();
      // API trả về mảng center, đảm bảo có latitude/longitude
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load centers', err);
      setError('Không thể tải danh sách trung tâm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();

    // Lấy vị trí người dùng để tính khoảng cách (nếu cho phép)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => {
        // Không có quyền lấy vị trí -> vẫn hoạt động
        console.warn('Geolocation denied or not available', err);
      });
    }
  }, []);

  // Khởi tạo map khi component mount (dùng Leaflet thuần)
  useEffect(() => {
    // Nếu map chưa khởi tạo và có element
    if (!mapRef.current && mapContainerRef.current) {
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 13,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
      } catch (err) {
        console.error('Leaflet init failed', err);
      }
    }

    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef.current]);

  // Khi centers hoặc userPos thay đổi, cập nhật markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xoá markers cũ
    (markersRef.current || []).forEach(m => {
      try { map.removeLayer(m); } catch (e) {}
    });
    markersRef.current = [];

    // Thêm marker mới theo filtered centers
    filtered.forEach((c) => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const marker = L.marker([lat, lng]);
      const dist = (userPos && !Number.isNaN(lat) && !Number.isNaN(lng)) ? haversineDistance(userPos.lat, userPos.lng, lat, lng) : null;
      const popupHtml = `
        <div class="popup">
          <div class="popup-title">${c.name || ''}</div>
          <div class="popup-addr">${c.address || ''}</div>
          <div class="popup-dist">${dist !== null ? dist.toFixed(2) + ' km' : 'Khoảng cách: N/A'}</div>
          <div style="margin-top:6px; display:flex; gap:6px">
            <button class="btn-small" onclick="window.__openEditCenter && window.__openEditCenter('${c.id || c.centerId || c._id}')">Sửa</button>
            <button class="btn-small btn-delete" onclick="window.__deleteCenter && window.__deleteCenter('${c.id || c.centerId || c._id}')">Xóa</button>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(map);
      markersRef.current.push(marker);
    });

  // Expose small window handlers so popup buttons can call React handlers
    // (Đây là cách ngắn để kích hoạt modal từ popup HTML; nếu muốn, có thể dùng event bridging rõ ràng hơn)
    window.__openEditCenter = (id) => {
      const center = centers.find(c => String(c.id || c.centerId || c._id) === String(id));
      if (center) openEditModal(center);
    };
    window.__deleteCenter = (id) => {
      const center = centers.find(c => String(c.id || c.centerId || c._id) === String(id));
      if (center) handleDelete(center);
    };

    // Nếu có userPos, pan map gần nhất (không auto-zoom quá nhiều)
    if (userPos) {
      try { map.panTo([userPos.lat, userPos.lng]); } catch (e) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centers, filtered, userPos]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') navigate('/admin/dashboard');
    else if (menu === 'accounts') navigate('/admin/users');
    else if (menu === 'revenue') navigate('/admin/revenue');
    else if (menu === 'parts') navigate('/admin/parts');
    else if (menu === 'centers') navigate('/admin/centers');
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', address: '', latitude: '', longitude: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (center) => {
    setEditing(center);
    setForm({ name: center.name || '', address: center.address || '', latitude: center.latitude || '', longitude: center.longitude || '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validation tối thiểu
    if (!form.name || !form.address) {
      alert('Vui lòng nhập tên và địa chỉ trung tâm');
      return;
    }

    try {
      if (editing) {
        await centerApi.updateCenter(editing.id || editing.centerId || editing._id, form);
        alert('Cập nhật trung tâm thành công');
      } else {
        await centerApi.createCenter(form);
        alert('Thêm trung tâm thành công');
      }
      setIsModalOpen(false);
      await loadCenters();
    } catch (err) {
      console.error('Save center failed', err);
      alert('Lỗi khi lưu trung tâm');
    }
  };

  const handleDelete = async (center) => {
    const id = center.id || center.centerId || center._id;
    if (!id) return alert('Không thể xóa: thiếu id');
    if (!window.confirm('Bạn có chắc muốn xóa trung tâm này?')) return;
    try {
      await centerApi.deleteCenter(id);
      alert('Đã xóa trung tâm');
      await loadCenters();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Xóa trung tâm thất bại');
    }
  };

  // Search (gọi API nếu muốn) - ở đây support realtime lọc local + nút Search để gọi API
  const handleSearchClick = async () => {
    if (!search) return loadCenters();
    try {
      setLoading(true);
      const data = await centerApi.searchCenters(search);
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed', err);
      alert('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  };

  // (Đã khai báo `filtered` và `defaultCenter` ở trên để tránh lỗi hoisting)

  return (
    <div className="admin-dashboard centers-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="VOLTFIT Logo" className="logo" />
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Bảng điều khiển</NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Quản lý tài khoản</NavLink>
          <NavLink to="/admin/revenue" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Quản lý doanh thu</NavLink>
          <NavLink to="/admin/parts" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Quản lý phụ tùng</NavLink>
          <NavLink to="/admin/centers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Quản lý trung tâm</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <AdminHeader />

        <div className="admin-content">
          <h1 className="centers-title">Quản Lý Trung Tâm</h1>

          <div className="centers-layout">
            <div className="centers-left">
              <div className="map-card">
                {/* Map container (div để Leaflet mount) */}
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '12px' }} />
              </div>
            </div>

            <div className="centers-right">
              <div className="centers-card">
                <div className="centers-card-header">
                  <input
                    className="centers-search"
                    placeholder="Tìm kiếm trung tâm ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn-search" onClick={handleSearchClick}>Tìm</button>
                </div>

                <div className="centers-list">
                  {loading ? (
                    <div className="center-loading">Đang tải...</div>
                  ) : error ? (
                    <div className="center-error">{error}</div>
                  ) : (
                    filtered.map((c) => {
                      const lat = parseFloat(c.latitude);
                      const lng = parseFloat(c.longitude);
                      const dist = (userPos && !Number.isNaN(lat) && !Number.isNaN(lng)) ? haversineDistance(userPos.lat, userPos.lng, lat, lng) : null;
                      return (
                        <div className="center-row" key={c.id || c.centerId || c._id}>
                          <div className="center-info">
                            <div className="center-name">{c.name}</div>
                            <div className="center-meta">{c.address} {dist !== null ? `• ${dist.toFixed(2)} km` : ''}</div>
                          </div>
                          <div className="center-actions">
                            <button className="btn-edit" onClick={() => openEditModal(c)}>Sửa</button>
                            <button className="btn-delete" onClick={() => handleDelete(c)}>Xóa</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="centers-card-footer">
                  <button className="btn-add" onClick={openAddModal}>Thêm</button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Form */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{editing ? 'Sửa trung tâm' : 'Thêm trung tâm'}</h3>
                <div className="form-group">
                  <label>Tên trung tâm</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                  <button onClick={handleSave} className="btn-save">Lưu</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
