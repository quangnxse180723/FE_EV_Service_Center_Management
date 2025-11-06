// src/modules/technician/pages/InspectionPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChecklistEditor from "../components/ChecklistEditor";
import { getOrCreateChecklist, updateChecklist, submitForApproval } from "../../technician/services/technicianService";

export default function InspectionPage() {
  const { recordId: paramId } = useParams();
  const navigate = useNavigate();
  const rememberedId = localStorage.getItem("last_schedule_id");  // lấy id gần nhất nếu có
  const scheduleId = paramId || rememberedId || null;

  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);
  const [checklistId, setChecklistId] = useState(null); // Lưu checklistId để gửi duyệt

  useEffect(() => {
    if (!scheduleId) return; // không có id thì chưa load
    (async () => {
      const { header, items } = await getOrCreateChecklist(scheduleId);
      setHeader(header); 
      setItems(items);
      setChecklistId(header.checklistId); // Lưu checklistId từ response
    })();
  }, [scheduleId]);

  const totals = useMemo(() => {
    // partCost đã bao gồm +10% từ backend
    const part = items.reduce((s,i)=>{
      const partCost = +i.partCost || 0;
      return s + partCost;
    }, 0);
    const labor= items.reduce((s,i)=>s+(+i.laborCost||0),0);
    return { part, labor, all: part+labor };
  }, [items]);

  const onSubmitApproval = async () => {
    // Backend cần scheduleId, không phải checklistId
    if (!scheduleId) {
      alert("Không tìm thấy ID lịch hẹn!");
      console.error('❌ Không có scheduleId');
      return;
    }
    
    console.log('🔍 DEBUG: Đang gửi duyệt với scheduleId:', scheduleId);
    console.log('🔍 DEBUG: checklistId:', checklistId, '(chỉ để tham khảo)');
    console.log('🔍 DEBUG: items hiện tại:', items);
    
    try {
      // BƯỚC 1: Lưu thay đổi checklist trước (giá, status)
      console.log('📝 BƯỚC 1: Lưu thay đổi checklist...');
      await updateChecklist(scheduleId, items);
      console.log('✅ BƯỚC 1: Đã lưu checklist thành công');
      
      // BƯỚC 2: Gửi duyệt cho khách hàng
      console.log('📤 BƯỚC 2: Gửi duyệt cho khách hàng...');
      await submitForApproval(scheduleId);
      console.log('✅ BƯỚC 2: Đã gửi duyệt thành công');
      
      alert("Đã gửi khách hàng duyệt!");
      navigate('/technician/services'); // Quay về danh sách
    } catch (error) {
      console.error('❌ Error submitting:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Lỗi không xác định';
      
      alert("Lỗi khi gửi duyệt:\n" + errorMsg + "\n\nVui lòng kiểm tra log backend để biết chi tiết.");
    }
  };

  // ⛳️ Trường hợp chưa có scheduleId → hiển thị hướng dẫn
  if (!scheduleId) {
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

  // ✅ Có scheduleId → render form như cũ
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
            <b>Tổng chi phí:</b>
            <div className="cost-row">
              <span className="cost-label">Vật tư:</span>
              <span className="cost-value">{formatVND(totals.part)}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label">Nhân công:</span>
              <span className="cost-value">{formatVND(totals.labor)}</span>
            </div>
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
        .left{text-align:left}
        .cost-row{display:grid;grid-template-columns:100px 1fr;gap:10px;margin:4px 0;font-size:16px}
        .cost-label{text-align:left}
        .cost-value{text-align:left;font-weight:600}
        .total{background:#ffeb3b;padding:6px 10px;border-radius:6px;font-weight:800;font-size:17px}
        .btn{background:#1e88e5;color:#fff;border:none;border-radius:6px;padding:8px 12px;font-weight:700;cursor:pointer}
      `}</style>
    </div>
  );
}
function formatVND(n){ try{return n.toLocaleString("vi-VN")+" VNĐ"}catch{return `${n} VNĐ`}}
