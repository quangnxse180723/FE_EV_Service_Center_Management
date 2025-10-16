// chỉnh số theo form 10.000vnđ có dấu phân cách hàng nghìn
// formatCurrency.js (global)
export function formatCurrencyVND(value) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN") + " vnđ";
}

// Dùng cho <input>: nhận "10.000", "10.000 vnđ", "  25.500  " → 25500 (number)
export function parseCurrencyVND(input) {
  if (input == null) return 0;
  const raw = String(input).replace(/[^\d]/g, "");
  return raw ? Number(raw) : 0;
}








