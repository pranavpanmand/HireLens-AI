const mongoose = require('mongoose');
const { generateEmbedding } = require('./src/services/embedding.service');
const { JobPosting } = require('./src/models/JobPosting');
const { env } = require('./src/config/env');

mongoose.connect(env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  const unembedded = await JobPosting.find({
      isActive: true,
      $or: [
          { embedding: { $exists: false } },
          { embedding: { $size: 0 } },
          { embeddedAt: null }
      ]
  });
  console.log(`Found ${unembedded.length} jobs to embed`);

  for(let job of unembedded) {
    try {
      const textToEmbed = `${job.title}. ${(job.description || '').substring(0, 8000)}`;
      const embedding = await generateEmbedding(textToEmbed);
      await JobPosting.updateOne({ _id: job._id }, { $set: { embedding, embeddedAt: new Date() } });
      console.log(`Embedded job: ${job.title}`);
    } catch(e) {
      console.error(`Failed to embed job ${job.title}`, e.message);
    }
  }

  process.exit(0);
});
