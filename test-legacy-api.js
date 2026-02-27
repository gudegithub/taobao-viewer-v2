// Test Legacy Taobao API
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];
const RAPIDAPI_HOST = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_HOST='))?.split('=')[1];

async function testLegacyAPI() {
  const testId = '522122071190';

  // Test v40
  console.log('=== Testing Legacy API v40 ===');
  const urlV40 = `https://${RAPIDAPI_HOST}/api/item/detail/v40/${testId}`;
  console.log('URL:', urlV40);

  const responseV40 = await fetch(urlV40, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('Status:', responseV40.status);
  const textV40 = await responseV40.text();
  console.log('Response (first 1000 chars):', textV40.substring(0, 1000));

  // Test v18
  console.log('\n\n=== Testing Legacy API v18 ===');
  const urlV18 = `https://${RAPIDAPI_HOST}/api/item/detail/v18/${testId}`;
  console.log('URL:', urlV18);

  const responseV18 = await fetch(urlV18, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('Status:', responseV18.status);
  const textV18 = await responseV18.text();
  console.log('Response (first 1000 chars):', textV18.substring(0, 1000));
}

testLegacyAPI().catch(console.error);
