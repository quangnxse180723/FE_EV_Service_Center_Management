/**
 * Test Helper cho Price List Feature
 * Copy và paste vào Console của trình duyệt để test
 */

// Test Mode 1: Xem tất cả 13 phụ tùng (read-only)
function testViewAllParts() {
  window.location.href = '/price-list';
}

// Test Mode 2: Xem bảng giá đề xuất từ technician (3 phụ tùng)
function testProposalMode() {
  const testParts = [
    { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000, quantity: 2 },
    { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000, quantity: 1 },
    { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000, quantity: 1 }
  ];
  
  window.localStorage.setItem('proposalParts', JSON.stringify(testParts));
  window.localStorage.setItem('isProposalMode', 'true');
  window.location.href = '/price-list';
}

// Test Mode 2: Với nhiều phụ tùng hơn (5 phụ tùng)
function testProposalModeExtended() {
  const testParts = [
    { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000, quantity: 2 },
    { id: 3, tenLinhKien: 'Vỏ bọc, tay gas', giaLinhKien: 200000, giaCongTho: 50000, quantity: 1 },
    { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000, quantity: 1 },
    { id: 8, tenLinhKien: 'Phanh trước', giaLinhKien: 200000, giaCongTho: 50000, quantity: 2 },
    { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000, quantity: 1 }
  ];
  
  window.localStorage.setItem('proposalParts', JSON.stringify(testParts));
  window.localStorage.setItem('isProposalMode', 'true');
  window.location.href = '/price-list';
}

// Export to window for easy access
window.testPriceList = {
  viewAll: testViewAllParts,
  proposal: testProposalMode,
  proposalExtended: testProposalModeExtended
};

console.log('✅ Test helpers loaded! Try:');
console.log('  testPriceList.viewAll()          - Xem tất cả 13 phụ tùng');
console.log('  testPriceList.proposal()         - Test với 3 phụ tùng đề xuất');
console.log('  testPriceList.proposalExtended() - Test với 5 phụ tùng đề xuất');
