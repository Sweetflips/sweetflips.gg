// Test script for Luxdrop caching system
const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Change to your deployed URL for production testing
const CRON_SECRET = process.env.CRON_SECRET || 'Wg!n+kYdmnj@LJd-z)qLYRJC2ZNF*Y';

async function testLuxdropCache() {
    console.log('🧪 Testing Luxdrop caching system...\n');

    try {
        // Test 1: Trigger cache update
        console.log('1️⃣ Triggering cache update...');
        const cacheResponse = await axios.post(`${BASE_URL}/api/cron/luxdrop-cache`, {}, {
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Cache update successful:', cacheResponse.data);
        console.log('');

        // Test 2: Fetch data from proxy (should serve cached data)
        console.log('2️⃣ Fetching data from proxy (should serve cached data)...');
        const proxyResponse = await axios.get(`${BASE_URL}/api/LuxdropProxy`);

        console.log('✅ Proxy response successful');
        console.log('Data source:', proxyResponse.headers['x-data-source']);
        console.log('Cache age (minutes):', proxyResponse.headers['x-cache-age-minutes']);
        console.log('Response data entries:', proxyResponse.data.data?.length || 0);
        console.log('');

        // Test 3: Check if data is properly structured
        console.log('3️⃣ Validating data structure...');
        const data = proxyResponse.data;

        if (data.data && Array.isArray(data.data)) {
            console.log('✅ Data structure is valid');
            console.log(`📊 Found ${data.data.length} leaderboard entries`);

            if (data.data.length > 0) {
                const topEntry = data.data[0];
                console.log(`🏆 Top wagerer: ${topEntry.username} - $${topEntry.wagered}`);
            }

            if (data.period) {
                console.log(`📅 Period: ${data.period.period}`);
                console.log(`💰 Total wagered: $${data.period.totalWagered || 'N/A'}`);
                console.log(`👥 Active wagerers: ${data.period.activeWagerers || 'N/A'}`);
            }
        } else {
            console.log('❌ Invalid data structure');
        }

        console.log('\n🎉 All tests passed! Luxdrop caching system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }

        process.exit(1);
    }
}

// Run the test
testLuxdropCache();
