// Test Legacy v18 API
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];
const RAPIDAPI_HOST = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_HOST='))?.split('=')[1];

async function testV18API() {
  // Test with the ID that worked with v10
  const testId = '954210457501';
  const url = `https://${RAPIDAPI_HOST}/v18/detail?itemId=${testId}&site=taobao`;

  console.log('Testing Legacy v18 API');
  console.log('URL:', url);
  console.log('Host:', RAPIDAPI_HOST);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('\nStatus:', response.status);
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    // Check specific fields
    if (data.success !== undefined) {
      console.log('\n=== Response Analysis ===');
      console.log('Success:', data.success);
      console.log('Code:', data.code);
      if (data.message) console.log('Message:', data.message);
      if (data.data) {
        console.log('Has data:', !!data.data);
        if (data.data.info) {
          console.log('Has info:', !!data.data.info);
          console.log('Title:', data.data.info.title);
        }
      }
    }
  } catch (e) {
    console.log('\nResponse (not JSON):', text.substring(0, 1000));
  }
}

testV18API().catch(console.error);
