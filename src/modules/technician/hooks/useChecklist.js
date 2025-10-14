import { useEffect, useState } from "react";
import { getOrCreateChecklist } from "../../technician/services/technicianService";

export function useChecklist(recordId){
  const [header,setHeader]=useState(null); const [items,setItems]=useState([]); const [loading,setLoading]=useState(false);
  const load = async ()=>{
    setLoading(true);
    try{ const data = await getOrCreateChecklist(recordId); setHeader(data.header); setItems(data.items); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ if(recordId) load(); },[recordId]);
  return { header, items, setItems, loading, reload: load };
}
