const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { DateTime } = require('luxon');

async function testAlternativeParameters() {
  console.log('Testing alternative parameter names and values with /external/affiliates...');
  
  const proxyAgent = new HttpsProxyAgent('http://ozxnqgrw:kbqc558eowm4@46.202.3.151:7417');
  
  // Current transition period dates
  const startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  const endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  
  const testCases = [
    {
      name: "Alternative parameter names - date_start/date_end",
      params: {
        codes: 'sweetflips',
        date_start: startDate.toISODate(),
        date_end: endDate.toISODate()
      }
    },
    {
      name: "Alternative period parameter",
      params: {
        codes: 'sweetflips',
        period: 'custom',
        start: startDate.toISODate(),
        end: endDate.toISODate()
      }
    },
    {
      name: "Unix timestamp format",
      params: {
        codes: 'sweetflips',
        from_timestamp: startDate.toSeconds(),
        to_timestamp: endDate.toSeconds()
      }
    },
    {
      name: "Range parameter with dates",
      params: {
        codes: 'sweetflips',
        range: `${startDate.toISODate()}_${endDate.toISODate()}`
      }
    },
    {
      name: "Monthly period with year/month",
      params: {
        codes: 'sweetflips',
        period: 'monthly',
        year: 2025,
        month: 8
      }
    },
    {
      name: "Date range with different format",
      params: {
        codes: 'sweetflips',
        daterange: `${startDate.toFormat('yyyy-MM-dd')} - ${endDate.toFormat('yyyy-MM-dd')}`
      }
    },
    {
      name: "Filter parameter approach",
      params: {
        codes: 'sweetflips',
        filter: {
          date: {
            from: startDate.toISODate(),
            to: endDate.toISODate()
          }
        }
      }
    },
    {
      name: "Query parameter with date conditions",
      params: {
        codes: 'sweetflips',
        where: `date >= '${startDate.toISODate()}' AND date <= '${endDate.toISODate()}'`
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
        
        // Check if amounts look different from lifetime amounts
        const topAmount = response.data[0].wagered;
        const hasReasonableAmounts = response.data.some(user => user.wagered < 1000);
        
        if (topAmount < 10000 || hasReasonableAmounts) {
          console.log('🎉 POTENTIAL MONTHLY DATA! (Lower amounts detected)');
          
          // Compare against known lifetime amounts
          const knownLifetimeAmount = 95611.21;
          if (Math.abs(topAmount - knownLifetimeAmount) > 1000) {
            console.log('🔥 DIFFERENT FROM LIFETIME DATA! This might be the solution!');
          }
        } else {
          console.log('⚠️  Still looks like lifetime amounts');
        }
      } else {
        console.log('❌ No data returned');
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.message);
      if (error.response?.status === 400) {
        console.log('ℹ️  Bad request - parameter might not be supported');
      }
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testAlternativeParameters().catch(console.error);