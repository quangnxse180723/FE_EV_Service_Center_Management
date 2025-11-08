import React, { useState } from 'react';

const GoogleMapComponent = ({ centers, selectedCenter, onCenterSelect }) => {
  const [hoveredCenter, setHoveredCenter] = useState(null);

  // Tạo URL cho Google Maps (không cần API key - dùng iframe embed trực tiếp)
  const getEmbedMapUrl = () => {
    // Nếu có center được chọn, hiển thị center đó
    if (selectedCenter && selectedCenter.latitude && selectedCenter.longitude) {
      const lat = parseFloat(selectedCenter.latitude);
      const lng = parseFloat(selectedCenter.longitude);
      const centerName = encodeURIComponent(selectedCenter.name || selectedCenter.centerName || 'Service Center');
      
      // Dùng Google Maps embed không cần API key (place mode)
      return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    

    // Default: TP.HCM
    return `https://maps.google.com/maps?q=10.762622,106.660172&t=&z=12&ie=UTF8&iwloc=&output=embed`;
  };

  const handleCenterClick = (center) => {
    if (onCenterSelect) {
      onCenterSelect(center);
    }
  };

  const embedUrl = getEmbedMapUrl();

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Google Maps Embed iframe */}
      <div style={{ width: '100%', height: '400px', position: 'relative', marginBottom: '16px' }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '8px' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title="Google Maps"
        />
      </div>

      {/* Thông báo center được chọn */}
      {selectedCenter && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>✅</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#155724', fontSize: '15px' }}>
              Đã chọn: {selectedCenter.name || selectedCenter.centerName}
            </h4>
            <p style={{ margin: '0', fontSize: '13px', color: '#155724' }}>
               {selectedCenter.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
