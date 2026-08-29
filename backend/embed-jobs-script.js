require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { embedAllJobs } = require('./src/controllers/recommendations.controller');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Create a mock req/res to pass to embedAllJobs
  const req = {};
  const res = {
    json: (data) => console.log('Done:', JSON.stringify(data, null, 2)),
  };
  const next = (err) => console.error('Error:', err);
  
  await embedAllJobs(req, res, next);
  process.exit(0);
}

run();
