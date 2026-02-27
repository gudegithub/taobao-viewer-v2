// Test Taobao 1688 API v10
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];

async function testV10API() {
  // Test with the ID that worked before
  const testId = '954210457501';
  const url = `https://taobao-1688-api1.p.rapidapi.com/v10/detail?itemId=${testId}&site=taobao`;

  console.log('Testing Taobao 1688 API v10');
  console.log('URL:', url);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'taobao-1688-api1.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('\nStatus:', response.status);
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    console.log('\nResponse structure:', JSON.stringify(data, null, 2).substring(0, 5000));

    // Log key fields
    if (data.result) {
      console.log('\n=== Key Fields ===');
      console.log('Title:', data.result.title);
      console.log('Price:', data.result.price);
      console.log('Item ID:', data.result.item_id);
      console.log('Has SKUs:', !!data.result.skus);
      console.log('Has seller_info:', !!data.result.seller_info);
      console.log('Has props_group:', !!data.result.props_group);
    }
  } catch (e) {
    console.log('\nResponse (not JSON):', text.substring(0, 1000));
  }
}

testV10API().catch(console.error);
