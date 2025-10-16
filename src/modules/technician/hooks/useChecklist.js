import { useCallback, useEffect, useState } from "react";
import { fetchChecklistTemplate, updateChecklistItem } from "../services/technicianService";

export function useChecklist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setList(await fetchChecklistTemplate());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setAction = useCallback(async (id, action) => {
    const updated = await updateChecklistItem(id, { action });
    setList(updated);
  }, []);

  const setNote = useCallback(async (id, note) => {
    const updated = await updateChecklistItem(id, { note });
    setList(updated);
  }, []);

  return { list, loading, refresh, setAction, setNote };
}
