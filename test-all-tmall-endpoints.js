// Test all Tmall Data Service API endpoints
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];

async function testEndpoint(name, path, params) {
  console.log(`\n=== Testing: ${name} ===`);
  const url = `https://taobao-tmall-data-service.p.rapidapi.com${path}?${params}`;
  console.log('URL:', url);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'taobao-tmall-data-service.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response (first 1000 chars):', text.substring(0, 1000));
}

async function testAllEndpoints() {
  const testId = '17621470828';

  // Endpoint 1: ItemMobileDetailGetDetail
  await testEndpoint(
    'ItemMobileDetailGetDetail',
    '/Item/MobileDetailGetDetail.ashx',
    `num_iid=${testId}`
  );

  // Endpoint 2: ItemGet
  await testEndpoint(
    'ItemGet',
    '/Item/ItemGet.ashx',
    `num_iid=${testId}`
  );

  // Endpoint 3: MobileWDetailGetItemDesc
  await testEndpoint(
    'MobileWDetailGetItemDesc',
    '/Item/MobileWDetailGetItemDesc.ashx',
    `num_iid=${testId}&type=1`
  );
}

testAllEndpoints().catch(console.error);
