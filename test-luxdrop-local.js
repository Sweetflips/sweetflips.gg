const http = require('http');

// Test the local API
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/LuxdropProxy',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    if (res.headers['content-type']?.includes('application/json')) {
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Failed to parse JSON:', e.message);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();