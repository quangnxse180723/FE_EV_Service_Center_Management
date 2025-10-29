export default function ChecklistEditor({ items=[], onChange }) {
  const update = (id, key, value) => {
    const next = items.map(it=>it.id===id?{...it,[key]:value}:it);
    onChange && onChange(next);
  };
  const addRow = () => {
    const nextId = (items[items.length-1]?.id || 0) + 1;
    onChange && onChange([...items, {id:nextId,name:"",status:"Kiểm tra",partCost:0,laborCost:0}]);
  };

  return (
    <div className="ce">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{width:60,textAlign:"center"}}>STT</th>
            <th>Tên phụ tùng</th>
            <th style={{width:180}}>Trạng thái</th>
            <th style={{width:180}}>Vật tư (vnđ)</th>
            <th style={{width:180}}>Nhân công (vnđ)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it,idx)=>(
            <tr key={it.id}>
              <td className="center">{idx+1}</td>
              <td><input className="ipt" value={it.name} onChange={e=>update(it.id,"name",e.target.value)} /></td>
              <td>
                <select className="ipt" value={it.status} onChange={e=>update(it.id,"status",e.target.value)}>
                  <option>Kiểm tra</option>
                  <option>Thay thế</option>
                  <option>Bôi trơn</option>
                </select>
              </td>
              <td><input type="number" className="ipt" value={it.partCost} min={0} onChange={e=>update(it.id,"partCost",+e.target.value)} /></td>
              <td><input type="number" className="ipt" value={it.laborCost} min={0} onChange={e=>update(it.id,"laborCost",+e.target.value)} /></td>
            </tr>
          ))}
          {items.length<6 && new Array(6-items.length).fill(0).map((_,i)=>(
            <tr key={`e-${i}`} className="empty"><td colSpan={5}>&nbsp;</td></tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:8}}>
        <button className="btn add" onClick={addRow}>+ Thêm dòng</button>
      </div>

      <style>{`
        .tbl{width:100%;border-collapse:collapse;background:#fff}
        .tbl th,.tbl td{border:2px solid #2c2c2c;padding:10px 12px}
        .tbl thead th{background:#efefef;font-weight:700}
        .center{text-align:center}
        .ipt{width:100%;padding:6px 8px;border:1px solid #bbb;border-radius:4px}
        .empty td{background:#d9d9d9;height:48px}
        .btn{padding:8px 12px;border:none;border-radius:4px;cursor:pointer;font-weight:700}
        .add{background:#f1f1f1}
      `}</style>
    </div>
  );
}
