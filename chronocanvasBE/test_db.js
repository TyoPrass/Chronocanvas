require("dotenv").config();
const mongoose = require("mongoose");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  if (collections.find(c => c.name === 'aiconfigs')) {
    const docs = await mongoose.connection.db.collection('aiconfigs').find({}).toArray();
    console.log("aiconfigs docs:", docs);
  }
  process.exit(0);
}

check();
