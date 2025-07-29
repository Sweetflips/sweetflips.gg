const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testCustomRangeEndpoint() {
  console.log('Testing /api/luxdrop/custom-range endpoint with Cloudflare bypass...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  // Current transition period dates
  const startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  const endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  
  const testCases = [
    {
      name: "Custom Range with ISO dates",
      url: "https://api.luxdrop.com/api/luxdrop/custom-range",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISODate(),
        to_date: endDate.toISODate()
      }
    },
    {
      name: "Custom Range with startDate/endDate",
      url: "https://api.luxdrop.com/api/luxdrop/custom-range", 
      params: {
        codes: 'sweetflips',
        startDate: startDate.toISODate(),
        endDate: endDate.toISODate()
      }
    },
    {
      name: "Custom Range with full ISO datetime",
      url: "https://api.luxdrop.com/api/luxdrop/custom-range",
      params: {
        codes: 'sweetflips',
        from_date: startDate.toISO(),
        to_date: endDate.toISO()
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
        timeout: 30000,
        httpsAgent: proxyAgent,
        httpAgent: proxyAgent,
        headers: {
          'x-api-key': '113ecb6008668493dffd81f3a4466633cea823ea07c801e75882558a66f722cd',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
      };

      const response = await axios(config);
      
      console.log('✅ SUCCESS!');
      console.log('Status:', response.status);
      console.log('Data type:', typeof response.data);
      console.log('Response keys:', Object.keys(response.data));
      
      if (Array.isArray(response.data)) {
        console.log(`Entries: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log('Top 3 wagered amounts:');
          response.data.slice(0, 3).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username}: $${user.wagered}`);
          });
          
          const topAmount = response.data[0].wagered;
          if (topAmount > 10000) {
            console.log('⚠️  These look like LIFETIME amounts (very high)');
          } else {
            console.log('✅ These look like MONTHLY amounts (reasonable)');
          }
        }
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`Entries: ${response.data.data.length}`);
        if (response.data.data.length > 0) {
          console.log('Top 3 wagered amounts:');
          response.data.data.slice(0, 3).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username}: $${user.wagered}`);
          });
          
          const topAmount = response.data.data[0].wagered;
          if (topAmount > 10000) {
            console.log('⚠️  These look like LIFETIME amounts (very high)');
          } else {
            console.log('✅ These look like MONTHLY amounts (reasonable)');
          }
        }
      } else {
        console.log('Response data:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.message);
      if (error.response?.data) {
        console.log('Error response:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

testCustomRangeEndpoint().catch(console.error);