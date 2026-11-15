import { matchedData } from 'express-validator'
import Product from '../models/Product.js'

const notFound = (res) => res.status(404).json({ message: 'Product not found' })

// POST /api/products  (authenticated)
export const createProduct = async (req, res) => {
  // matchedData(..., body only) keeps just the validated fields, so a client cannot
  // sneak in extra fields such as "createdBy".
  const data = matchedData(req, { locations: ['body'] })
  const product = await Product.create({ ...data, createdBy: req.user._id })
  res.status(201).json({ message: 'Product created', product })
}

// GET /api/products?page=1&limit=10  (public, paginated)
export const listProducts = async (req, res) => {
  const { page = 1, limit = 10 } = matchedData(req, { locations: ['query'] })

  const [products, total] = await Promise.all([
    Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(),
  ])

  res.json({
    products,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}

// GET /api/products/:id  (public)
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return notFound(res)
  res.json({ product })
}

// PUT /api/products/:id  (authenticated)
export const updateProduct = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] })

  // The update query returns null when the id does not exist -> 404 before anything changes.
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
  if (!product) return notFound(res)
  res.json({ message: 'Product updated', product })
}

// DELETE /api/products/:id  (authenticated)
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return notFound(res)
  res.json({ message: 'Product deleted' })
}
