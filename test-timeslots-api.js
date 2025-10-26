// ====================================
// 🧪 TEST TIME SLOTS API
// ====================================
// Copy toàn bộ code này và paste vào Browser Console (F12 → Console)
// Đảm bảo bạn đang ở trang http://localhost:5174/booking

async function testTimeSlotsAPI() {
    console.log('🚀 Starting Time Slots API Test...\n');
    
    // Test parameters
    const centerId = 1;
    const date = '2025-10-28'; // Ngày mai
    
    console.log('📋 Test Config:');
    console.log('  - Center ID:', centerId);
    console.log('  - Date:', date);
    console.log('  - API URL: http://localhost:8080/api/customer/schedules/available-slots\n');
    
    try {
        const url = `http://localhost:8080/api/customer/schedules/available-slots?centerId=${centerId}&date=${date}`;
        
        console.log('📡 Calling API:', url);
        console.log('⏳ Please wait...\n');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📊 Response Status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ SUCCESS! API is working!\n');
        console.log('📦 Response Data:', data);
        console.log('📏 Total Slots:', data.length);
        
        // Analyze slots
        const morning = data.filter(s => parseInt(s.time.split(':')[0]) < 12);
        const afternoon = data.filter(s => parseInt(s.time.split(':')[0]) >= 12);
        const available = data.filter(s => s.available > 0);
        const full = data.filter(s => s.available === 0);
        
        console.log('\n📊 Analysis:');
        console.log('  ☀️ Morning slots:', morning.length);
        console.log('  🌙 Afternoon slots:', afternoon.length);
        console.log('  ✅ Available slots:', available.length);
        console.log('  ❌ Full slots:', full.length);
        
        console.log('\n📋 Detailed Slots:');
        console.table(data);
        
        console.log('\n✨ Test completed successfully!');
        return data;
        
    } catch (error) {
        console.error('❌ TEST FAILED!');
        console.error('Error:', error.message);
        
        if (error.message.includes('Failed to fetch')) {
            console.error('\n🔍 Possible causes:');
            console.error('  1. Backend is not running (http://localhost:8080)');
            console.error('  2. CORS not configured properly');
            console.error('  3. Endpoint not implemented yet');
            console.error('\n💡 Solutions:');
            console.error('  1. Start backend: mvn spring-boot:run');
            console.error('  2. Check @CrossOrigin annotation in controller');
            console.error('  3. Implement getAvailableSlots() method in service');
        } else if (error.message.includes('404')) {
            console.error('\n🔍 Error 404: Endpoint not found');
            console.error('💡 Backend cần implement:');
            console.error('   @GetMapping("/available-slots")');
            console.error('   public ResponseEntity<?> getAvailableSlots(Integer centerId, String date)');
        } else if (error.message.includes('500')) {
            console.error('\n🔍 Error 500: Backend internal error');
            console.error('💡 Check backend console logs for details');
        }
        
        console.error('\nFull error:', error);
        return null;
    }
}

// Run the test
console.log('╔════════════════════════════════════════╗');
console.log('║   TIME SLOTS API INTEGRATION TEST      ║');
console.log('╚════════════════════════════════════════╝\n');

testTimeSlotsAPI();
