export default function JobList({ jobs=[], onCheckIn, onCreateInspection }) {
  return (
    <div className="joblist">
      <table className="tbl">
        <thead>
          <tr>
            <th>Khách hàng</th><th>Xe</th><th>Biển số xe</th><th>Giờ hẹn</th><th>Trạng thái</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(j=>(
            <tr key={j.record_id}>
              <td>{j.customer_name}</td>
              <td>{j.vehicle_model}</td>
              <td>{j.license_plate}</td>
              <td>{j.appointment_time}</td>
              <td>
                <span className={j.status==="Chờ nhận"?"badge wait":"badge prog"}>{j.status}</span>
              </td>
              <td className="actions">
                {j.status==="Chờ nhận" ? (
                  <button className="btn green" onClick={()=>onCheckIn(j.record_id)}>Xác nhận</button>
                ) : (
                  <button className="btn red" onClick={()=>onCreateInspection(j.record_id)}>Tạo biên bản kiểm tra</button>
                )}
              </td>
            </tr>
          ))}
          {jobs.length<6 && new Array(6-jobs.length).fill(0).map((_,i)=>(
            <tr key={`empty-${i}`} className="empty"><td colSpan={6}>&nbsp;</td></tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .tbl{width:100%;border-collapse:collapse;background:#fff}
        .tbl th,.tbl td{border:2px solid #2c2c2c;padding:10px 12px}
        .tbl thead th{background:#efefef;font-weight:700}
        .actions{white-space:nowrap}
        .btn{padding:8px 12px;border:none;border-radius:4px;font-weight:700;cursor:pointer}
        .green{background:#20c933;color:#fff}.red{background:#ff3b30;color:#fff}
        .badge{display:inline-block;padding:6px 10px;border-radius:4px;font-weight:700}
        .wait{background:#ffe66d}.prog{background:#6ea8fe;color:#fff}
        .empty td{background:#d9d9d9;height:56px}
      `}</style>
    </div>
  );
}
