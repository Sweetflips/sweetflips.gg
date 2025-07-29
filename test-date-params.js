const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testDateParameters() {
  console.log('Testing different date parameter formats...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  // Current transition period dates
  const startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  const endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  
  const testCases = [
    {
      name: "ISO Date only (current)",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(), // "2025-07-28"
        to_date: endDate.toISODate()      // "2025-08-31"
      }
    },
    {
      name: "Full ISO DateTime",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISO(),     // "2025-07-28T00:00:00.000Z"
        to_date: endDate.toISO()          // "2025-08-31T23:59:59.999Z"
      }
    },
    {
      name: "Unix timestamps",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toSeconds().toString(),
        to_date: endDate.toSeconds().toString()
      }
    },
    {
      name: "Different parameter names",
      params: {
        codes: 'sweetflips',
        start_date: startDate.toISODate(),
        end_date: endDate.toISODate()
      }
    },
    {
      name: "No date parameters (check lifetime vs monthly)",
      params: {
        codes: 'sweetflips'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
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
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
        
        // Check if amounts look like monthly vs lifetime
        const topAmount = response.data[0].wagered;
        if (topAmount > 10000) {
          console.log('⚠️  These look like LIFETIME amounts (very high)');
        } else {
          console.log('✅ These look like MONTHLY amounts (reasonable)');
        }
      } else {
        console.log('❌ No data returned');
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.message);
      if (error.response?.data) {
        console.log('Error response:', error.response.data);
      }
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testDateParameters().catch(console.error);