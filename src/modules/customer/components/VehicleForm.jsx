import React, { useState } from "react";

const VehicleForm = () => {
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
      setMaintenance("Chưa đến kỳ bảo dưỡng tiếp theo");
    } else if (numKm >= 1000 && numKm < 5000) {
      setMaintenance("Bảo dưỡng lần đầu");
    } else if (numKm >= 5000 && numKm < 10000) {
      setMaintenance("Bảo dưỡng lần 2");
    } else if (numKm >= 10000 && numKm < 15000) {
      setMaintenance("Bảo dưỡng lần 3");
    } else if (numKm >= 15000 && numKm < 20000) {
      setMaintenance("Bảo dưỡng lần 4");
    } else if (numKm >= 20000 && numKm < 25000) {
      setMaintenance("Bảo dưỡng lần 5");
    } else if (numKm >= 25000 && numKm < 30000) {
      setMaintenance("Bảo dưỡng lần 6");
    } else if (numKm >= 30000 && numKm < 35000) {
      setMaintenance("Bảo dưỡng lần 7");
    } else if (numKm >= 35000 && numKm < 40000) {
      setMaintenance("Bảo dưỡng lần 8");
    } else if (numKm >= 40000 && numKm < 45000) {
      setMaintenance("Bảo dưỡng lần 9");
    } else if (numKm >= 45000 && numKm < 50000) {
      setMaintenance("Bảo dưỡng lần 10");
    } else if (numKm >= 50000 && numKm < 55000) {
      setMaintenance("Bảo dưỡng lần 11");
    } else if (numKm >= 55000) {
      setMaintenance("Bảo dưỡng dịch vụ");
    } else {
      setMaintenance("Chưa đến kỳ bảo dưỡng tiếp theo");
    }
  };

  return (
    <div>
      <h2>Quản lý xe của bạn</h2>
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
        <div style={{ marginTop: "10px", color: "green" }}>
          <strong>Kết quả: {maintenance}</strong>
        </div>
      )}
      {/* ...existing code quản lý xe... */}
    </div>
  );
};

export default VehicleForm;
