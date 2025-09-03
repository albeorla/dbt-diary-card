#!/usr/bin/env node

// Quick test to check if test-auth endpoint is accessible
const http = require('http');

const data = JSON.stringify({ email: 'test@example.com' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-auth/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-test-auth': 'dev',
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Response: ${responseData}`);
    try {
      const json = JSON.parse(responseData);
      console.log(`sessionToken: ${json.sessionToken || 'UNDEFINED'}`);
    } catch (e) {
      console.log('Not valid JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end();
