// Test script for luxdrop leaderboard cache cron
const axios = require('axios');

async function testCron() {
  try {
    console.log('🧪 Testing luxdrop leaderboard cache cron...');
    
    // Test with a mock cron secret (replace with actual secret)
    const response = await axios.post('http://localhost:3000/api/cron/luxdropleaderboardcache', {}, {
      headers: {
        'Authorization': 'Bearer test-secret', // Replace with actual CRON_SECRET
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cron job response:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ Cron job failed:', error.response?.status, error.response?.data || error.message);
  }
}

testCron();
