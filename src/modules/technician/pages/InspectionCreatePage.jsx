// src/modules/technician/pages/InspectionCreatePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useChecklist } from "../hooks/useChecklist";
import { useInspection } from "../hooks/useInspection";
import ChecklistEditor from "../components/ChecklistEditor";
import InspectionForm from "../components/InspectionForm";
import styles from "./InspectionCreatePage.module.css";

// service để lấy job theo id (dùng list có sẵn)
import { fetchAssignedJobs } from "../services/technicianService";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function InspectionCreatePage() {
  const q = useQuery();
  const jobId = q.get("jobId") || ""; // nếu có, auto điền form

  const { list, loading, setAction, setNote } = useChecklist();
  const { saveInspection, saving } = useInspection();

  const [form, setForm] = useState({
    customerName: "",
    vehicle: "",
    plate: "",
    schedule: "",
    material: 0,
    labor: 0,
  });

  // nếu có jobId -> load job & prefll form
  useEffect(() => {
    let alive = true;
    async function prefillFromJob() {
      if (!jobId) return;
      try {
        const jobs = await fetchAssignedJobs();
        const job = jobs.find((j) => j.id === jobId);
        if (job && alive) {
          setForm((s) => ({
            ...s,
            customerName: job.customerName || "",
            vehicle: job.vehicle || "",
            plate: job.plate || "",
            schedule: job.schedule || "",
          }));
        }
      } catch (e) {
        // bỏ qua lỗi mock
      }
    }
    prefillFromJob();
    return () => { alive = false; };
  }, [jobId]);

  const handleSubmit = async () => {
    const payload = {
      jobId: jobId || undefined,
      ...form,
      // checklist hiện tại trong editor
      checklist: list.map((i) => ({
        id: i.id,
        name: i.name,
        action: i.action || "",
        note: i.note || "",
      })),
    };

    const res = await saveInspection(payload);
    if (res?.ok) {
      alert("Tạo biên bản thành công!");
      // TODO: điều hướng nếu cần, ví dụ quay về danh sách phiếu dịch vụ
      // navigate("/technician/service-orders");
    }
  };

  return (
    <div className={styles.page}>
      {/* nếu có jobId thì hiển thị nhãn nhỏ */}
      {jobId && (
        <div className={styles.jobHint}>
          Đang tạo biên bản cho <b>{jobId}</b>
        </div>
      )}

      <ChecklistEditor
        data={list}
        onChangeAction={setAction}
        onChangeNote={setNote}
      />

      <InspectionForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {loading && (
        <div className={styles.loading}>Đang tải mẫu kiểm tra…</div>
      )}
    </div>
  );
}
