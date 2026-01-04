const mongoose = require('mongoose')
const uri = process.env.MONGODB_URI || ''

async function connect() {
  if (!uri) return
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err)
  }
}

module.exports = { connect, mongoose }
