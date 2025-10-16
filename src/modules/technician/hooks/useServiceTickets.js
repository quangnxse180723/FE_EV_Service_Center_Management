import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchServiceTickets,
  fetchServiceTicketById,
  setItemConfirmed,
  updateItemCosts,
  finalizeTicket,
  calcCosts,
} from "../services/technicianService";

export function useServiceTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchServiceTickets();
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { tickets, loading, refresh };
}

export function useServiceTicketDetail(id) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchServiceTicketById(id);
    setTicket(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const costs = useMemo(() => (ticket ? calcCosts(ticket) : { material:0, labor:0, total:0 }), [ticket]);

  const toggleConfirm = useCallback(async (no, value) => {
    const updated = await setItemConfirmed(id, no, value);
    setTicket(updated);
  }, [id]);

  const changeCosts = useCallback(async (no, material, labor) => {
    const updated = await updateItemCosts(id, no, material, labor);
    setTicket(updated);
  }, [id]);

  const finalize = useCallback(async () => {
    const updated = await finalizeTicket(id);
    setTicket(updated);
  }, [id]);

  return { ticket, loading, costs, toggleConfirm, changeCosts, finalize, reload: load };
}
