// src/modules/technician/pages/InspectionPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChecklistEditor from "../components/ChecklistEditor";
import { getOrCreateChecklist, submitForApproval } from "../../technician/services/technicianService";

export default function InspectionPage() {
  const { recordId: paramId } = useParams();
  const navigate = useNavigate();
  const rememberedId = localStorage.getItem("last_record_id");  // lấy id gần nhất nếu có
  const recordId = paramId || rememberedId || null;

  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!recordId) return; // không có id thì chưa load
    (async () => {
      const { header, items } = await getOrCreateChecklist(recordId);
      setHeader(header); setItems(items);
    })();
  }, [recordId]);

  const totals = useMemo(() => {
    const part = items.reduce((s,i)=>s+(+i.partCost||0),0);
    const labor= items.reduce((s,i)=>s+(+i.laborCost||0),0);
    return { part, labor, all: part+labor };
  }, [items]);

  const onSubmitApproval = async () => {
    await submitForApproval(recordId);
    alert("Đã gửi khách hàng duyệt!");
  };

  // ⛳️ Trường hợp chưa có recordId → hiển thị hướng dẫn
  if (!recordId) {
    return (
      <div className="page">
        <h1 className="title">Tạo biên bản kiểm tra</h1>
        <div className="empty-card">
          <p><b>Chưa chọn xe.</b> Hãy vào trang <i>Xe được phân công</i> và bấm “Tạo biên bản kiểm tra”.</p>
          <button className="btn" onClick={()=>navigate("/technician/assigned-jobs")}>Đi tới Xe được phân công</button>
        </div>
        <style>{`
          .title{font-size:28px;font-weight:800;margin-bottom:16px}
          .empty-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}
          .btn{margin-top:8px;background:#1e88e5;color:#fff;border:none;border-radius:6px;padding:8px 12px;font-weight:700;cursor:pointer}
        `}</style>
      </div>
    );
  }

  // ✅ Có recordId → render form như cũ
  return (
    <div className="page">
      <h1 className="title">Tạo biên bản kiểm tra</h1>
      <div className="sheet">
        {header && (
          <div className="meta">
            <p><b>Chủ xe:</b> {header.owner}</p>
            <p><b>Xe:</b> {header.vehicle}</p>
            <p><b>Biển số xe:</b> {header.license}</p>
            <p><b>Ngày / giờ:</b> {header.dateTime}</p>
          </div>
        )}
        <h3 style={{margin:"8px 0"}}>Checklist:</h3>
        <ChecklistEditor items={items} onChange={setItems} />
        <hr className="divider" />
        <div className="est">
          <div className="left">
            <b>Chi phí dự kiến:</b>
            <ul>
              <li>Nhân công: {formatVND(totals.labor)}</li>
              <li>Vật tư: {formatVND(totals.part)}</li>
            </ul>
          </div>
          <div className="right">
            <span className="total">Tổng: {formatVND(totals.all)}</span>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:16}}>
          <button className="btn" onClick={onSubmitApproval}>Gửi khách hàng duyệt</button>
        </div>
      </div>
      <style>{`
        .title{font-size:28px;font-weight:800;margin-bottom:16px}
        .sheet{background:#d9d9d9;padding:20px;border-radius:8px}
        .meta p{margin:4px 0}
        .divider{border:none;border-top:3px solid #111;margin:12px 0}
        .est{display:flex;justify-content:space-between;align-items:center}
        .total{background:#ffeb3b;padding:6px 10px;border-radius:6px;font-weight:800}
        .btn{background:#1e88e5;color:#fff;border:none;border-radius:6px;padding:8px 12px;font-weight:700;cursor:pointer}
      `}</style>
    </div>
  );
}
function formatVND(n){ try{return n.toLocaleString("vi-VN")+" vnđ"}catch{return `${n} vnđ`}}
