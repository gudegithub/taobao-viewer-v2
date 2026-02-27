// Test Taobao Tmall Data Service API
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];

async function testTmallAPI() {
  // Test with the item ID from the screenshot
  const testId = '17621470828';

  // Correct endpoint path with /Item/ prefix
  const url = `https://taobao-tmall-data-service.p.rapidapi.com/Item/MobileDetailGetDetail.ashx?num_iid=${testId}`;

  console.log('Testing Tmall API with ID:', testId);
  console.log('URL:', url);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'taobao-tmall-data-service.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('\nStatus:', response.status);
  const text = await response.text();
  console.log('Response (first 2000 chars):', text.substring(0, 2000));

  // Try to parse as JSON
  try {
    const data = JSON.parse(text);
    console.log('\nParsed JSON structure:', Object.keys(data));
  } catch (e) {
    console.log('\nResponse is not JSON, might be XML or other format');
  }

  // Also test with the ID we've been using
  console.log('\n\n=== Testing with our ID ===');
  const ourId = '522122071190';
  const url2 = `https://taobao-tmall-data-service.p.rapidapi.com/Item/MobileDetailGetDetail.ashx?num_iid=${ourId}`;

  const response2 = await fetch(url2, {
    headers: {
      'x-rapidapi-host': 'taobao-tmall-data-service.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('Status:', response2.status);
  const text2 = await response2.text();
  console.log('Response (first 2000 chars):', text2.substring(0, 2000));
}

testTmallAPI().catch(console.error);
