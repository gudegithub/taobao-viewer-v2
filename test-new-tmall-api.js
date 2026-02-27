// Test new Taobao Tmall 1688 API
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];

async function testNewAPI() {
  // Test with the ID from the screenshot
  const testId = '954210457501';
  const url = `https://taobao-tmall-16881.p.rapidapi.com/api/tkl/item/detail?provider=taobao&id=${testId}`;

  console.log('Testing new Taobao Tmall 1688 API');
  console.log('URL:', url);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'taobao-tmall-16881.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('\nStatus:', response.status);
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    console.log('\nResponse structure:', JSON.stringify(data, null, 2).substring(0, 3000));
  } catch (e) {
    console.log('\nResponse (not JSON):', text.substring(0, 1000));
  }

  // Test with our ID
  console.log('\n\n=== Testing with our ID ===');
  const ourId = '522122071190';
  const url2 = `https://taobao-tmall-16881.p.rapidapi.com/api/tkl/item/detail?provider=taobao&id=${ourId}`;

  const response2 = await fetch(url2, {
    headers: {
      'x-rapidapi-host': 'taobao-tmall-16881.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  console.log('Status:', response2.status);
  const text2 = await response2.text();

  try {
    const data2 = JSON.parse(text2);
    console.log('\nResponse structure:', JSON.stringify(data2, null, 2).substring(0, 3000));
  } catch (e) {
    console.log('\nResponse (not JSON):', text2.substring(0, 1000));
  }
}

testNewAPI().catch(console.error);
