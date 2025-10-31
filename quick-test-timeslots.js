// ╔════════════════════════════════════════════════════════════╗
// ║  QUICK TEST - TIME SLOTS API                               ║
// ║  Copy và paste vào Console (F12) tại localhost:5173/booking║
// ╚════════════════════════════════════════════════════════════╝

(async function testTimeSlotsAPI() {
    console.clear();
    console.log('%c╔════════════════════════════════════════════════╗', 'color: #1976d2; font-weight: bold');
    console.log('%c║      🧪 TIME SLOTS API QUICK TEST              ║', 'color: #1976d2; font-weight: bold');
    console.log('%c╚════════════════════════════════════════════════╝', 'color: #1976d2; font-weight: bold');
    console.log('');

    // Config
    const BASE_URL = 'http://localhost:8080';
    const ENDPOINT = '/api/customer/schedules/available-slots';
    const centerId = 1;
    const date = new Date().toISOString().split('T')[0]; // Today

    console.log('%c📋 Test Configuration:', 'color: #2196f3; font-weight: bold');
    console.log('  🔹 Backend:', BASE_URL);
    console.log('  🔹 Endpoint:', ENDPOINT);
    console.log('  🔹 Center ID:', centerId);
    console.log('  🔹 Date:', date);
    console.log('');

    try {
        const url = `${BASE_URL}${ENDPOINT}?centerId=${centerId}&date=${date}`;
        
        console.log('%c📡 Sending Request...', 'color: #ff9800; font-weight: bold');
        console.log('  URL:', url);
        console.log('');

        const startTime = performance.now();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log('%c✅ Response Received!', 'color: #4caf50; font-weight: bold; font-size: 14px');
        console.log('  ⏱️ Duration:', duration, 'ms');
        console.log('  📊 Status:', response.status, response.statusText);
        console.log('');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Analyze data
        const morning = data.filter(s => parseInt(s.time.split(':')[0]) < 12);
        const afternoon = data.filter(s => parseInt(s.time.split(':')[0]) >= 12);
        const available = data.filter(s => s.available > 0);
        const full = data.filter(s => s.available === 0);
        const few = data.filter(s => s.available > 0 && s.available <= 3);

        console.log('%c📦 Data Summary:', 'color: #9c27b0; font-weight: bold; font-size: 14px');
        console.log('  ├─ Total Slots:', data.length);
        console.log('  ├─ ☀️ Morning:', morning.length, 'slots');
        console.log('  ├─ 🌙 Afternoon:', afternoon.length, 'slots');
        console.log('  ├─ ✅ Available:', available.length, 'slots');
        console.log('  ├─ ⚠️ Few left:', few.length, 'slots');
        console.log('  └─ ❌ Full:', full.length, 'slots');
        console.log('');

        if (morning.length > 0) {
            console.log('%c☀️ Morning Slots:', 'background: #fff3e0; color: #f57c00; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.table(morning.map(s => ({
                Time: s.time,
                Available: `${s.available}/${s.total || 12}`,
                Status: s.available === 0 ? '❌ FULL' : s.available <= 3 ? '⚠️ FEW' : '✅ OK'
            })));
        }

        if (afternoon.length > 0) {
            console.log('%c🌙 Afternoon Slots:', 'background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.table(afternoon.map(s => ({
                Time: s.time,
                Available: `${s.available}/${s.total || 12}`,
                Status: s.available === 0 ? '❌ FULL' : s.available <= 3 ? '⚠️ FEW' : '✅ OK'
            })));
        }

        console.log('%c📋 Raw JSON Response:', 'color: #607d8b; font-weight: bold');
        console.log(JSON.stringify(data, null, 2));
        console.log('');

        console.log('%c🎉 TEST PASSED! API is working correctly!', 'background: #4caf50; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px');
        console.log('');
        console.log('%c💡 Next Steps:', 'color: #2196f3; font-weight: bold');
        console.log('  1. Navigate to Step 3 in booking page');
        console.log('  2. Select a date from date picker');
        console.log('  3. Watch time slots load automatically');
        console.log('  4. Try selecting different dates to see slots update');
        console.log('');

        return data;

    } catch (error) {
        console.log('%c❌ TEST FAILED!', 'background: #f44336; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px');
        console.log('');
        console.error('%cError Details:', 'color: #f44336; font-weight: bold', error);
        console.log('');

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('%c🔍 Possible Causes:', 'background: #ff9800; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.log('  ❌ Backend không chạy (port 8080)');
            console.log('  ❌ CORS chưa được config cho port 5173');
            console.log('  ❌ Endpoint chưa được implement');
            console.log('');
            console.log('%c💡 Solutions:', 'background: #2196f3; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.log('  1️⃣ Kiểm tra backend đang chạy: http://localhost:8080');
            console.log('  2️⃣ Kiểm tra CORS config trong Controller:');
            console.log('     @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})');
            console.log('  3️⃣ Restart backend sau khi thay đổi config');
            
        } else if (error.message.includes('404')) {
            console.log('%c🔍 Error 404 - Endpoint Not Found', 'background: #ff9800; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.log('  ❌ Backend chưa có endpoint: GET /api/customer/schedules/available-slots');
            console.log('');
            console.log('%c💡 Backend cần implement:', 'background: #2196f3; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.log(`
@GetMapping("/available-slots")
public ResponseEntity<?> getAvailableSlots(
    @RequestParam Integer centerId,
    @RequestParam String date) {
    var slots = scheduleService.getAvailableSlots(centerId, date);
    return ResponseEntity.ok(slots);
}
            `);
            
        } else if (error.message.includes('500')) {
            console.log('%c🔍 Error 500 - Server Error', 'background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold');
            console.log('  ❌ Backend có lỗi khi xử lý request');
            console.log('  💡 Kiểm tra console log của backend để xem chi tiết');
        }

        console.log('');
        return null;
    }
})();

// ════════════════════════════════════════════════════════════
// Sau khi chạy test này, nếu thấy lỗi CORS:
// ════════════════════════════════════════════════════════════
// Thêm vào CustomerScheduleController.java:
// @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
