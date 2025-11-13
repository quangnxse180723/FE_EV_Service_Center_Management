import React, { useState, useEffect } from 'react';

const GoogleMapComponent = ({ centers, selectedCenter, onCenterSelect }) => {
  const [hoveredCenter, setHoveredCenter] = useState(null);
  const [mapUrl, setMapUrl] = useState('');

  // Tạo URL cho Google Maps (không cần API key - dùng iframe embed trực tiếp)
  const getEmbedMapUrl = (center) => {
    // Nếu có center được chọn, hiển thị center đó
    if (center) {
      // Hỗ trợ nhiều format tọa độ: latitude/longitude, lat/lng, hoặc lat/lon
      const lat = parseFloat(center.latitude || center.lat || center.latitude);
      const lng = parseFloat(center.longitude || center.lng || center.lon);
      
      console.log('🗺️ Getting map URL for center:', {
        centerName: center.name || center.centerName,
        latitude: center.latitude,
        longitude: center.longitude,
        parsedLat: lat,
        parsedLng: lng,
        isValidLat: !isNaN(lat),
        isValidLng: !isNaN(lng)
      });
      
      // Kiểm tra tọa độ hợp lệ
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const centerName = center.name || center.centerName || 'Service Center';
        
        // Dùng Google Maps embed với tên địa điểm (sẽ hiển thị label đỏ bên cạnh marker)
        // Format: q=LAT,LNG(TÊN) - Google sẽ tự động hiển thị tên bên cạnh marker
        const url = `https://maps.google.com/maps?q=${lat},${lng}(${encodeURIComponent(centerName)})&z=15&output=embed`;
        console.log('✅ Map URL generated:', url);
        return url;
      } else {
        console.warn('⚠️ Invalid coordinates:', { lat, lng, center });
      }
    }

    // Default: TP.HCM
    console.log('🏙️ Using default map (TP.HCM)');
    return `https://maps.google.com/maps?q=10.762622,106.660172&t=&z=12&ie=UTF8&iwloc=&output=embed`;
  };

  // Update map URL khi selectedCenter thay đổi
  useEffect(() => {
    const newUrl = getEmbedMapUrl(selectedCenter);
    setMapUrl(newUrl);
  }, [selectedCenter]);

  // Set initial map URL
  useEffect(() => {
    if (!mapUrl) {
      setMapUrl(getEmbedMapUrl(selectedCenter));
    }
  }, []);

  const handleCenterClick = (center) => {
    if (onCenterSelect) {
      onCenterSelect(center);
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Google Maps Embed iframe */}
      <div style={{ width: '100%', height: '400px', position: 'relative', marginBottom: '16px' }}>
        <iframe
          key={mapUrl} // Force reload khi URL thay đổi
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '8px' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title="Google Maps"
        />
        
        {/* Custom marker label overlay - hiển thị tên bên cạnh marker */}
        {selectedCenter && selectedCenter.name && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 5
          }}>
            {/* Tên trung tâm bên cạnh marker */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '25px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#d32f2f',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              border: '1px solid #d32f2f'
            }}>
              {selectedCenter.name || selectedCenter.centerName}
            </div>
            
            
            </div>
          
        )}
      </div>

      {/* Thông báo center được chọn */}
      {selectedCenter && selectedCenter.latitude && selectedCenter.longitude && (
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
              📍 {selectedCenter.address}
            </p>
            {!isNaN(parseFloat(selectedCenter.latitude)) && !isNaN(parseFloat(selectedCenter.longitude)) && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#155724', opacity: 0.8 }}>
                📌 Tọa độ: {parseFloat(selectedCenter.latitude).toFixed(6)}, {parseFloat(selectedCenter.longitude).toFixed(6)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
