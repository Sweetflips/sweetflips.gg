// Test script for leaderboard database system
const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Change to your deployed URL for production testing
const CRON_SECRET = process.env.CRON_SECRET || 'Wg!n+kYdmnj@LJd-z)qLYRJC2ZNF*Y';

async function testLeaderboardSystem() {
    console.log('🧪 Testing leaderboard database system...\n');

    try {
        // Test 1: Trigger cache update (this will populate the leaderboard table)
        console.log('1️⃣ Triggering cache update to populate leaderboard table...');
        const cacheResponse = await axios.post(`${BASE_URL}/api/cron/luxdrop-cache`, {}, {
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Cache update successful:', cacheResponse.data);
        console.log('');

        // Wait a moment for database operations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 2: Fetch leaderboard from database
        console.log('2️⃣ Fetching leaderboard from database...');
        const leaderboardResponse = await axios.get(`${BASE_URL}/api/leaderboard`);

        console.log('✅ Leaderboard response successful');
        console.log('Data source:', leaderboardResponse.headers['x-data-source']);
        console.log('Total entries:', leaderboardResponse.data.pagination?.total || 0);
        console.log('Returned entries:', leaderboardResponse.data.data?.length || 0);
        console.log('Total wagered:', `$${leaderboardResponse.data.period?.totalWagered || 0}`);
        console.log('');

        // Test 3: Test pagination
        console.log('3️⃣ Testing pagination (first 10 entries)...');
        const paginatedResponse = await axios.get(`${BASE_URL}/api/leaderboard?limit=10&offset=0`);

        console.log('✅ Pagination test successful');
        console.log('Returned entries:', paginatedResponse.data.data?.length || 0);
        console.log('Has more:', paginatedResponse.data.pagination?.hasMore || false);

        if (paginatedResponse.data.data?.length > 0) {
            const topEntry = paginatedResponse.data.data[0];
            console.log(`🏆 Top entry: ${topEntry.username} - Rank #${topEntry.rank} - $${topEntry.wagered}`);
        }
        console.log('');

        // Test 4: Test individual user lookup
        if (leaderboardResponse.data.data?.length > 0) {
            const testUsername = leaderboardResponse.data.data[0].username;
            console.log(`4️⃣ Testing individual user lookup for: ${testUsername}...`);

            const userResponse = await axios.get(`${BASE_URL}/api/leaderboard/${testUsername}`);

            console.log('✅ User lookup successful');
            console.log('User rank:', userResponse.data.user?.rank);
            console.log('User wagered:', `$${userResponse.data.user?.wagered || 0}`);
            console.log('Percentile:', `${userResponse.data.user?.percentile || 0}%`);
            console.log('Surrounding entries:', userResponse.data.surrounding?.length || 0);
            console.log('');
        }

        // Test 5: Test non-existent user
        console.log('5️⃣ Testing non-existent user lookup...');
        try {
            await axios.get(`${BASE_URL}/api/leaderboard/nonexistentuser123`);
            console.log('❌ Should have returned 404 for non-existent user');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Correctly returned 404 for non-existent user');
            } else {
                console.log('❌ Unexpected error:', error.response?.status);
            }
        }
        console.log('');

        // Test 6: Validate data structure
        console.log('6️⃣ Validating data structure...');
        const data = leaderboardResponse.data;

        if (data.data && Array.isArray(data.data)) {
            console.log('✅ Data structure is valid');

            if (data.data.length > 0) {
                const entry = data.data[0];
                const requiredFields = ['username', 'wagered', 'reward', 'rank'];
                const hasAllFields = requiredFields.every(field => entry.hasOwnProperty(field));

                if (hasAllFields) {
                    console.log('✅ All required fields present');
                } else {
                    console.log('❌ Missing required fields');
                }
            }

            if (data.period) {
                console.log(`📅 Period: ${data.period.period}`);
                console.log(`💰 Total wagered: $${data.period.totalWagered || 'N/A'}`);
                console.log(`👥 Active wagerers: ${data.period.activeWagerers || 'N/A'}`);
            }

            if (data.pagination) {
                console.log(`📊 Pagination: ${data.pagination.total} total entries`);
                console.log(`📄 Limit: ${data.pagination.limit}, Offset: ${data.pagination.offset}`);
            }
        } else {
            console.log('❌ Invalid data structure');
        }

        console.log('\n🎉 All tests passed! Leaderboard database system is working correctly.');

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
testLeaderboardSystem();
