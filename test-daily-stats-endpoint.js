const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testDailyStatsEndpoint() {
  console.log('Testing /api/luxdrop/daily-stats endpoint...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  // Current transition period dates
  const startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  const endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  
  const params = {
    codes: 'sweetflips',
    from_date: startDate.toISODate(),
    to_date: endDate.toISODate(),
    method: 'snapshot'
  };

  console.log('Parameters:', JSON.stringify(params, null, 2));
  
  try {
    const config = {
      method: 'get',
      url: 'https://api.luxdrop.com/api/luxdrop/daily-stats',
      params: params,
      timeout: 30000,
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      headers: {
        'x-api-key': '113ecb6008668493dffd81f3a4466633cea823ea07c801e75882558a66f722cd',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };

    const response = await axios(config);
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data type:', typeof response.data);
    console.log('Response structure:', Object.keys(response.data || {}));
    
    if (response.data && response.data.snapshots) {
      console.log(`Snapshots: ${response.data.snapshots.length}`);
      console.log('Sample snapshot:', JSON.stringify(response.data.snapshots[0], null, 2));
      
      // Aggregate wagering by player
      const playerTotals = {};
      response.data.snapshots.forEach(snapshot => {
        const username = snapshot.name || snapshot.username || `User${snapshot.id}`;
        const wagerAmount = Number(snapshot.wager_amount) || 0;
        
        if (!playerTotals[username]) {
          playerTotals[username] = 0;
        }
        playerTotals[username] += wagerAmount;
      });
      
      const sortedPlayers = Object.entries(playerTotals)
        .map(([username, wagered]) => ({ username, wagered }))
        .sort((a, b) => b.wagered - a.wagered);
      
      console.log('Top 3 players by wagered amount:');
      sortedPlayers.slice(0, 3).forEach((player, index) => {
        console.log(`${index + 1}. ${player.username}: $${player.wagered}`);
      });
      
      const topAmount = sortedPlayers[0]?.wagered || 0;
      if (topAmount < 10000) {
        console.log('🎉 SUCCESS! These look like MONTHLY amounts!');
      } else {
        console.log('⚠️  Still high amounts - might still be lifetime data');
      }
      
    } else if (Array.isArray(response.data)) {
      console.log(`Direct array with ${response.data.length} entries`);
      console.log('Sample entry:', JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('Unexpected response format:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.message);
    if (error.response?.data) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDailyStatsEndpoint().catch(console.error);