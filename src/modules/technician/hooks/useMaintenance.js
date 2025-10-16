import { useCallback, useEffect, useState } from "react";
import { fetchMaintenanceList } from "../services/technicianService";

export function useMaintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setItems(await fetchMaintenanceList());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, refresh };
}
