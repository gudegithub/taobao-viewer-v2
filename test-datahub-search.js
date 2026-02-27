// Test DataHub search API
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf-8');
const RAPIDAPI_KEY = envFile.split('\n').find(line => line.startsWith('RAPIDAPI_KEY='))?.split('=')[1];

async function testSearch() {
  const url = 'https://taobao-datahub.p.rapidapi.com/item_search_image_x?q=鞋子&page=0';

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'taobao-datahub.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  // Extract first item ID if available
  if (data.result?.status?.data && typeof data.result.status.data === 'object') {
    const items = data.result.status.data.item || data.result.status.data.items;
    if (items && items.length > 0) {
      console.log('\nFirst item ID:', items[0].item_id || items[0].itemId);
    }
  }
}

testSearch().catch(console.error);
