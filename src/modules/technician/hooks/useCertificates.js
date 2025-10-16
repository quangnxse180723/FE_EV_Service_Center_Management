import { useCallback, useEffect, useState } from "react";
import { fetchCertificates } from "../services/technicianService";

export function useCertificates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setList(await fetchCertificates());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { list, loading, refresh };
}
