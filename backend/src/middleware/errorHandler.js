export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Central error handler: every error passed to next(err) ends up here.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' })
  }
  // Bad ObjectId that slipped past validation
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` })
  }
  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  // Unique index violation (two registrations racing with the same email)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  console.error(err)
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
}
