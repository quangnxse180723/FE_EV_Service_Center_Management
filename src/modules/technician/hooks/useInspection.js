import { useCallback, useState } from "react";
import { createInspectionRecord } from "../services/technicianService";

export function useInspection() {
  const [saving, setSaving] = useState(false);
  const saveInspection = useCallback(async (payload) => {
    setSaving(true);
    const res = await createInspectionRecord(payload);
    setSaving(false);
    return res;
  }, []);
  return { saveInspection, saving };
}
