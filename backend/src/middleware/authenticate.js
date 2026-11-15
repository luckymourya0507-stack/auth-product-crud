import User from '../models/User.js'
import { verifyAccessToken } from '../utils/tokens.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Reads "Authorization: Bearer <accessToken>", verifies it and attaches the user to req.user.
// Any route placed after this middleware is protected.
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Access token missing' })
  }

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch (err) {
    // The frontend uses this 401 to know it should call /refresh-token and retry.
    const message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
    return res.status(401).json({ message })
  }

  const user = await User.findById(payload.sub)
  if (!user) return res.status(401).json({ message: 'User no longer exists' })

  req.user = user
  next()
})
