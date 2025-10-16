export default function DashboardPage() {
  const stats = [
    { label: "Số xe đang xử lý", value: 2, color: "#ef4444" },
    { label: "Công việc trong ngày", value: 2, color: "#22c55e" },
  ];
  const shifts = [
    { text: "Thứ 2 8:00–12:00", checkin: true },
    { text: "Thứ 4 8:00–12:00" },
    { text: "Thứ 6 8:00–12:00" },
  ];

  return (
    <div className="wrap">
      <h1 className="title">Dashboard</h1>

      <div className="cards">
        {stats.map((s,i)=>(
          <div key={i} className="card">
            <div className="value" style={{color:s.color}}>{s.value}</div>
            <div className="desc">{s.label}</div>
          </div>
        ))}

        <div className="card purple">
          <div className="title2">Lịch phân công ca làm</div>
          <ul className="shifts">
            {shifts.map((s,i)=>(
              <li key={i}>
                <span>{s.text}</span>
                {s.checkin ? <b className="checkin">Check-in</b> : <i className="slot" />}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .title{font-size:28px;font-weight:800;margin-bottom:16px}
        .cards{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:16px}
        .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}
        .value{font-size:36px;font-weight:900}
        .desc{font-weight:800;margin-top:8px}
        .purple{background:#7c3aed;color:#fff}
        .title2{font-weight:800;margin-bottom:10px}
        .shifts{display:flex;flex-direction:column;gap:10px}
        .shifts li{display:flex;justify-content:space-between;align-items:center;background:#fff;color:#111;border-radius:8px;padding:8px 10px}
        .checkin{color:#1d4ed8}
        .slot{display:inline-block;width:70px;height:20px;background:#d1d5db;border-radius:6px}
      `}</style>
    </div>
  );
}
