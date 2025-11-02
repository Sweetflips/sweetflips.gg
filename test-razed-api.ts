// test-razed-api.ts
// Test script to verify Razed API connection
// Run with: npm run test:razed
// Or: npx tsx test-razed-api.ts

// Load env vars from .env.local
import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnvVars() {
  try {
    const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (err) {
    console.warn('⚠️  Could not load .env.local, using existing env vars');
  }
}

loadEnvVars();

const API_URL = process.env.BASE_RAZED_API_URL as string;
const REFERRAL_KEY = process.env.AUTH_RAZED as string;

if (!API_URL || !REFERRAL_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   BASE_RAZED_API_URL:', API_URL ? '✓' : '✗');
  console.error('   AUTH_RAZED:', REFERRAL_KEY ? '✓' : '✗');
  process.exit(1);
}

console.log('🔍 Testing Razed API connection...');
console.log('📡 API URL:', API_URL.substring(0, 50) + '...');
console.log('🔑 Key present:', REFERRAL_KEY ? 'Yes' : 'No');

const now = new Date();
const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

const formatDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

const fromParam = formatDate(fromDate);
const toParam = formatDate(toDate);

// Construct URL with query parameters (GET request)
const baseUrl = API_URL.includes('?') ? API_URL.split('?')[0] : API_URL;
const urlWithParams = `${baseUrl}?referral_code=SweetFlips&from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}&top=50`;

// Get Cloudflare cookie from env if available
const cloudflareCookie = process.env.RAZED_CLOUDFLARE_COOKIE;

console.log('\n📅 Date range:');
console.log('   From:', fromParam);
console.log('   To:', toParam);
console.log('\n🌐 Full URL:', urlWithParams);
console.log('\n🔑 Using Referral Key:', REFERRAL_KEY.substring(0, 20) + '...');
console.log('🍪 Cloudflare Cookie:', cloudflareCookie ? 'Present' : 'Not set\n');

const headers: Record<string, string> = {
  "X-Referral-Key": REFERRAL_KEY,
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://razed.com/",
  "Origin": "https://razed.com",
};

if (cloudflareCookie) {
  headers["Cookie"] = cloudflareCookie;
}

console.log('\n📤 Request Headers:');
Object.keys(headers).forEach(key => {
  if (key === 'X-Referral-Key') {
    console.log(`   ${key}: ${headers[key].substring(0, 20)}...`);
  } else if (key === 'Cookie') {
    console.log(`   ${key}: ${headers[key].substring(0, 50)}...`);
  } else {
    console.log(`   ${key}: ${headers[key]}`);
  }
});
console.log('');

async function testAPI() {
  try {
    console.log('⏳ Making request...');
    const startTime = Date.now();

    const response = await fetch(urlWithParams, {
      method: "GET",
      headers,
    });

    const duration = Date.now() - startTime;
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Duration: ${duration}ms`);

    // Log headers
    console.log('\n📋 Response Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('cf-') || key.toLowerCase().includes('x-')) {
        console.log(`   ${key}: ${value}`);
      }
    });

    const textResponse = await response.text();
    console.log(`\n📄 Response Length: ${textResponse.length} bytes`);
    console.log(`\n📝 Response Preview (first 500 chars):`);
    console.log(textResponse.substring(0, 500));

    // Check for Cloudflare challenge
    const isCloudflare = textResponse.includes('Just a moment') || textResponse.includes('cf-browser-verification') || textResponse.includes('challenge-platform');
    if (isCloudflare) {
      console.error('\n🚫 Cloudflare challenge detected!');
      console.error('   Response contains Cloudflare bot protection');
    }

    if (!response.ok) {
      console.error(`\n❌ API Error: ${response.status}`);
      if (response.status === 429 || isCloudflare) {
        console.error('🚫 Rate limited by Cloudflare');
        console.error('\n💡 Suggestions:');
        console.error('   1. Check if RAZED_CLOUDFLARE_COOKIE is set in .env.local');
        console.error('   2. Get a fresh cookie from browser DevTools');
        console.error('   3. Cookie should be in format: __cf_bm=...');
      }
      return;
    }

    try {
      const jsonResponse = JSON.parse(textResponse);
      console.log('\n✅ Successfully parsed JSON');
      console.log('\n📊 Response Structure:');
      console.log('   Type:', typeof jsonResponse);
      console.log('   Keys:', Object.keys(jsonResponse));

      if (jsonResponse.data) {
        console.log('   Data type:', Array.isArray(jsonResponse.data) ? 'Array' : typeof jsonResponse.data);
        if (Array.isArray(jsonResponse.data)) {
          console.log('   Data length:', jsonResponse.data.length);
          if (jsonResponse.data.length > 0) {
            console.log('   First entry keys:', Object.keys(jsonResponse.data[0]));
            console.log('   First entry:', JSON.stringify(jsonResponse.data[0], null, 2));
          }
        }
      }

      console.log('\n✅ API test successful!');
    } catch (parseError) {
      console.error('\n❌ Failed to parse JSON:', parseError);
      console.error('Response text:', textResponse.substring(0, 1000));
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testAPI();
