import React, { useState } from "react";

const BookingForm = () => {
  const [km, setKm] = useState("");
  const [maintenance, setMaintenance] = useState("");

  const handleKmChange = (e) => {
    const value = e.target.value;
    setKm(value);
    if (value === "") {
      setMaintenance("");
      return;
    }
    const numKm = Number(value);
    if (numKm < 1000) {
      setMaintenance("Bảo dưỡng lần đầu");
    } else if (numKm >= 5000) {
      setMaintenance("Bảo dưỡng lần 2");
    } else {
      setMaintenance("Chưa đến kỳ bảo dưỡng tiếp theo");
    }
  };

  return (
    <div>
      <h2>Đặt lịch bảo dưỡng</h2>
      <label>
        Số km xe đã chạy:
        <input
          type="number"
          value={km}
          onChange={handleKmChange}
          min="0"
          placeholder="Nhập số km xe đã chạy"
        />
      </label>
      {maintenance && (
        <div style={{ marginTop: "10px", color: "blue" }}>
          <strong>Kết quả: {maintenance}</strong>
        </div>
      )}
      {/* ...existing code đặt lịch... */}
    </div>
  );
};

export default BookingForm;
