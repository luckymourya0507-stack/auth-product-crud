// Entry point. "dotenv/config" must be the FIRST import so process.env is filled
// before any other file reads it.
import 'dotenv/config'
import app from './app.js'
import connectDB from './config/db.js'

const required = ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']
const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')} (see .env.example)`)
  process.exit(1)
}

const PORT = process.env.PORT || 5000

await connectDB()
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
