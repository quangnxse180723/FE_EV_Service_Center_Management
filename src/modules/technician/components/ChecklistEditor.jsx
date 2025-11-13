export default function ChecklistEditor({ items=[], onChange }) {
  const update = (id, key, value) => {
    const next = items.map(it=>{
      if(it.id===id) {
        const updated = {...it,[key]:value};
        
        // Tự động điều chỉnh giá khi thay đổi status
        if(key === "status") {
          if(value === "Kiểm tra" || value === "Bôi trơn") {
            // Set giá = 0
            updated.partCost = 0;
            updated.laborCost = 0;
          } else if(value === "Thay thế") {
            // Dùng giá gốc từ backend (originalPartCost, originalLaborCost)
            updated.partCost = it.originalPartCost || 0;
            updated.laborCost = it.originalLaborCost || 0;
          }
        }
        
        // Khi nhập partPrice, lưu trực tiếp (không chia 1.1 nữa)
        if(key === "partPrice") {
          updated.partCost = value; // Lưu giá gốc
        }
        
        return updated;
      }
      return it;
    });
    onChange && onChange(next);
  };
  
  const addRow = () => {
    const nextId = (items[items.length-1]?.id || 0) + 1;
    onChange && onChange([...items, {id:nextId,name:"",status:"Kiểm tra",partCost:0,laborCost:0,originalPartCost:0,originalLaborCost:0}]);
  };
  
  // Format số với dấu chấm phân cách
  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Parse số từ string có dấu chấm
  const parseNumber = (str) => {
    if (!str) return 0;
    return parseInt(str.toString().replace(/\./g, '')) || 0;
  };

  return (
    <div className="ce">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{width:60,textAlign:"center"}}>STT</th>
            <th>Tên phụ tùng</th>
            <th style={{width:180}}>Trạng thái</th>
            <th style={{width:180}}>Vật tư</th>
            <th style={{width:180}}>Nhân công</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it,idx)=>{
            // Hiển thị giá vật tư gốc (không nhân 1.1 nữa)
            const partPrice = it.partCost || 0;
            
            return (
              <tr key={it.id}>
                <td className="center">{idx+1}</td>
                <td className="part-name">{it.name}</td>
                <td>
                  <select className="ipt" value={it.status} onChange={e=>update(it.id,"status",e.target.value)}>
                    <option>Thay thế</option>
                    <option>Kiểm tra</option>
                    <option>Bôi trơn</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="text" 
                    className="ipt" 
                    value={formatNumber(Math.round(partPrice))} 
                    onChange={e=>update(it.id,"partPrice",parseNumber(e.target.value))} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="ipt" 
                    value={formatNumber(it.laborCost)} 
                    onChange={e=>update(it.id,"laborCost",parseNumber(e.target.value))} 
                  />
                </td>
              </tr>
            );
          })}
          {items.length<6 && new Array(6-items.length).fill(0).map((_,i)=>(
            <tr key={`e-${i}`} className="empty"><td colSpan={5}>&nbsp;</td></tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .tbl{width:100%;border-collapse:collapse;background:#fff}
        .tbl th,.tbl td{border:2px solid #2c2c2c;padding:10px 12px}
        .tbl thead th{background:#efefef;font-weight:700}
        .center{text-align:center}
        .part-name{padding:10px 12px;font-weight:500;color:#1a1a2e}
        .ipt{width:100%;padding:6px 8px;border:1px solid #bbb;border-radius:4px}
        .empty td{background:#d9d9d9;height:48px}
        .btn{padding:8px 12px;border:none;border-radius:4px;cursor:pointer;font-weight:700}
        .add{background:#f1f1f1}
      `}</style>
    </div>
  );
}
