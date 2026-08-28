import { env } from './src/config/env';
import { AdzunaService } from './src/services/adzuna.service';
import { AiService } from './src/services/ai.service';
import axios from 'axios';

async function runTests() {
  console.log('--- TESTING APIS ---');
  console.log('Adzuna App ID:', env.ADZUNA_APP_ID);
  console.log('Adzuna App Key:', env.ADZUNA_APP_KEY ? '***' : 'MISSING');
  console.log('Gemini API Key:', env.GEMINI_API_KEY ? '***' : 'MISSING');
  
  try {
    console.log('\n1. Testing Adzuna API directly...');
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${env.ADZUNA_APP_ID}&app_key=${env.ADZUNA_APP_KEY}&results_per_page=1&what=react`;
    const response = await axios.get(adzunaUrl);
    console.log(`Adzuna Success! Found ${response.data.count} jobs. First job title: ${response.data.results[0]?.title}`);
  } catch (error: any) {
    console.error('Adzuna API Error:', error.response?.data || error.message);
  }

  try {
    console.log('\n2. Testing Gemini API directly...');
    const prompt = 'Return exactly "API_KEY_VALID" if you can read this.';
    const result = await AiService.generateJson(prompt, {});
    console.log('Gemini Success! Response:', result);
  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
  }

  console.log('\n--- TESTS FINISHED ---');
  process.exit(0);
}

runTests();
