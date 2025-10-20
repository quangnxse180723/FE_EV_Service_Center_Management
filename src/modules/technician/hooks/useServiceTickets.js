import { useCallback, useEffect, useMemo, useState } from "react";
import technicianApi from "@/api/technicianApi";

// Helper function để tính tổng chi phí
const calcCosts = (ticket) => {
  if (!ticket || !ticket.items) return { material: 0, labor: 0, total: 0 };
  const material = ticket.items.reduce((s, i) => s + (i.materialCost || i.material || 0), 0);
  const labor = ticket.items.reduce((s, i) => s + (i.laborCost || i.labor || 0), 0);
  return { material, labor, total: material + labor };
};

export function useServiceTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getServiceTickets(params);
      setTickets(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách phiếu sửa chữa');
      console.error('Error fetching service tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { tickets, loading, error, refresh };
}

export function useServiceTicketDetail(id) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getServiceTicketById(id);
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải chi tiết phiếu sửa chữa');
      console.error('Error fetching service ticket detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const costs = useMemo(() => (ticket ? calcCosts(ticket) : { material: 0, labor: 0, total: 0 }), [ticket]);

  const toggleConfirm = useCallback(async (itemId, value) => {
    try {
      const response = await technicianApi.confirmTicketItem(id, itemId, value);
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi xác nhận hạng mục');
      console.error('Error confirming ticket item:', err);
      throw err;
    }
  }, [id]);

  const changeCosts = useCallback(async (itemId, materialCost, laborCost) => {
    try {
      const response = await technicianApi.updateItemCosts(id, itemId, { materialCost, laborCost });
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật chi phí');
      console.error('Error updating item costs:', err);
      throw err;
    }
  }, [id]);

  const updateProgress = useCallback(async (itemId, progress) => {
    try {
      const response = await technicianApi.updateItemProgress(id, itemId, progress);
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật tiến độ');
      console.error('Error updating item progress:', err);
      throw err;
    }
  }, [id]);

  const finalize = useCallback(async () => {
    try {
      const response = await technicianApi.finalizeTicket(id);
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi hoàn thành phiếu sửa chữa');
      console.error('Error finalizing ticket:', err);
      throw err;
    }
  }, [id]);

  const updateStatus = useCallback(async (status) => {
    try {
      const response = await technicianApi.updateTicketStatus(id, status);
      setTicket(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái');
      console.error('Error updating ticket status:', err);
      throw err;
    }
  }, [id]);

  return { 
    ticket, 
    loading, 
    error, 
    costs, 
    toggleConfirm, 
    changeCosts, 
    updateProgress, 
    finalize, 
    updateStatus,
    reload: load 
  };
}
