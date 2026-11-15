import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// credentials:true lets the browser send/receive the httpOnly refresh-token cookie
// across origins; origin must be an exact URL (not "*") when credentials are on.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10kb' })) // parse JSON bodies (and cap their size)
app.use(cookieParser()) // fills req.cookies

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
