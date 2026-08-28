const https = require('https');

const adzunaAppId = '67bb026c';
const adzunaAppKey = '1061f04254625cc46c1c6c88607701c3';

console.log('Testing Adzuna API...');

const options = {
  hostname: 'api.adzuna.com',
  port: 443,
  path: `/v1/api/jobs/us/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=1&what=react`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.results) {
        console.log(`Adzuna Success! Found ${parsed.count} jobs. First job title: ${parsed.results[0]?.title}`);
      } else {
        console.log('Adzuna API Error/Unexpected Response:', data);
      }
    } catch (e) {
      console.log('Error parsing Adzuna response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Adzuna Request Error:', error);
});

req.end();
