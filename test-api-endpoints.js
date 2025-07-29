const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testDifferentEndpoints() {
  console.log('Testing different API endpoints and versions...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  // Current transition period dates
  const startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  const endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  
  const testCases = [
    {
      name: "V1 External Affiliates",
      url: "https://api.luxdrop.com/v1/external/affiliates",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "V2 External Affiliates", 
      url: "https://api.luxdrop.com/v2/external/affiliates",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "External Affiliates Monthly", 
      url: "https://api.luxdrop.com/external/affiliates/monthly",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "External Affiliates Range",
      url: "https://api.luxdrop.com/external/affiliates/range",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "External Affiliates Stats",
      url: "https://api.luxdrop.com/external/affiliates/stats",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "External Stats",
      url: "https://api.luxdrop.com/external/stats",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "API Affiliate Stats",
      url: "https://api.luxdrop.com/api/affiliate/stats",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "External Leaderboard",
      url: "https://api.luxdrop.com/external/leaderboard",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log('URL:', testCase.url);
    console.log('Parameters:', JSON.stringify(testCase.params, null, 2));
    
    try {
      const config = {
        method: 'get',
        url: testCase.url,
        params: testCase.params,
        timeout: 15000,
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
      
      if (Array.isArray(response.data)) {
        console.log(`Entries: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log('Top 3 wagered amounts:');
          response.data.slice(0, 3).forEach((user, index) => {
            const amount = user.wagered || user.amount || user.total || 0;
            console.log(`${index + 1}. ${user.username || user.name || user.id}: $${amount}`);
          });
          
          // Check for monthly vs lifetime amounts
          const topAmount = response.data[0].wagered || response.data[0].amount || response.data[0].total || 0;
          if (topAmount < 10000) {
            console.log('🎉 POTENTIAL MONTHLY DATA! (Lower amounts)');
          } else if (topAmount !== 95611.21) {
            console.log('🔥 DIFFERENT DATA STRUCTURE! Investigate further');
          } else {
            console.log('⚠️  Same lifetime data');
          }
        }
      } else if (response.data && typeof response.data === 'object') {
        console.log('Response structure:', Object.keys(response.data));
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`Nested data entries: ${response.data.data.length}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status || 'NETWORK', error.message);
      if (error.response?.status === 404) {
        console.log('ℹ️  Endpoint not found');
      } else if (error.response?.status === 403) {
        console.log('ℹ️  Cloudflare blocked');
      }
    }
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

testDifferentEndpoints().catch(console.error);