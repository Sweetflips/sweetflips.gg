const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testCorrectAPIParameters() {
  console.log('Testing Luxdrop API with correct startDate/endDate parameters...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  const testCases = [
    {
      name: "Contest Period (July 28 - August 31)",
      params: {
        codes: ["sweetflips"],
        startDate: "2025-07-28",
        endDate: "2025-08-31"
      }
    },
    {
      name: "July Only (July 28-31, 4 days)",
      params: {
        codes: ["sweetflips"],
        startDate: "2025-07-28",
        endDate: "2025-07-31"
      }
    },
    {
      name: "August Only (August 1-31, 31 days)",
      params: {
        codes: ["sweetflips"],
        startDate: "2025-08-01",
        endDate: "2025-08-31"
      }
    },
    {
      name: "Single Day Test (July 28)",
      params: {
        codes: ["sweetflips"],
        startDate: "2025-07-28",
        endDate: "2025-07-28"
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log('Parameters:', JSON.stringify(testCase.params, null, 2));
    
    try {
      const config = {
        method: 'get',
        url: 'https://api.luxdrop.com/external/affiliates',
        params: testCase.params,
        timeout: 30000,
        httpsAgent: proxyAgent,
        httpAgent: proxyAgent,
        headers: {
          'x-api-key': '113ecb6008668493dffd81f3a4466633cea823ea07c801e75882558a66f722cd',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
        },
      };

      const response = await axios(config);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ SUCCESS!');
        console.log(`Entries: ${response.data.length}`);
        console.log('Top 3 wagered amounts:');
        response.data.slice(0, 3).forEach((user, index) => {
          console.log(`${index + 1}. ${user.username}: $${user.wagered}`);
        });
        
        // Check total wagering for this period
        const totalWagered = response.data.reduce((sum, user) => sum + (user.wagered || 0), 0);
        console.log(`Total wagered for period: $${totalWagered.toFixed(2)}`);
        
      } else {
        console.log('❌ No data returned');
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.message);
      if (error.response?.data) {
        console.log('Error sample:', error.response.data.substring(0, 200) + '...');
      }
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

testCorrectAPIParameters().catch(console.error);