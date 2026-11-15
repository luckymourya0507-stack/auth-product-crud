import bcrypt from 'bcrypt'
import { matchedData } from 'express-validator'
import User from '../models/User.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/tokens.js'

const SALT_ROUNDS = 10

// POST /api/auth/register  (public)
export const register = async (req, res) => {
  const { name, email, password } = matchedData(req) // only validated fields; confirmPassword is not saved

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const hashed = await bcrypt.hash(password, SALT_ROUNDS) // never store plain text
  const user = await User.create({ name, email, password: hashed })

  // No tokens on register: the user must log in. toJSON strips the password.
  res.status(201).json({ message: 'Account created', user })
}

// POST /api/auth/login  (public)
export const login = async (req, res) => {
  const { email, password } = matchedData(req)

  // password is select:false, so we ask for it explicitly here
  const user = await User.findOne({ email }).select('+password')
  const ok = user && (await bcrypt.compare(password, user.password))

  // Same message for "no such email" and "wrong password" so attackers cannot probe for emails.
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

  const accessToken = signAccessToken(user._id)
  const refreshToken = signRefreshToken(user._id)

  // Persist a HASH of the refresh token so it can be revoked on logout.
  await User.updateOne({ _id: user._id }, { refreshTokenHash: hashToken(refreshToken) })

  setRefreshCookie(res, refreshToken)
  res.json({ message: 'Logged in', accessToken, user })
}

// POST /api/auth/refresh-token  (public, but needs a valid refresh token)
export const refreshToken = async (req, res) => {
  // Cookie is the normal route; body is a documented fallback for non-browser clients.
  const token = req.cookies?.refreshToken || req.body?.refreshToken
  if (!token) return res.status(401).json({ message: 'Refresh token missing' })

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    clearRefreshCookie(res)
    return res.status(401).json({ message: 'Invalid or expired refresh token. Please log in again.' })
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash')

  // The token must match the one stored in the DB. If it does not, an old (already rotated
  // or logged-out) token is being reused: revoke everything and force a new login.
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    if (user) await User.updateOne({ _id: user._id }, { refreshTokenHash: null })
    clearRefreshCookie(res)
    return res.status(403).json({ message: 'Refresh token revoked or reused. Please log in again.' })
  }

  // Rotation: issue a brand-new pair and replace the stored hash, so each refresh token works once.
  const newAccessToken = signAccessToken(user._id)
  const newRefreshToken = signRefreshToken(user._id)
  await User.updateOne({ _id: user._id }, { refreshTokenHash: hashToken(newRefreshToken) })

  setRefreshCookie(res, newRefreshToken)
  res.json({ accessToken: newAccessToken })
}

// POST /api/auth/logout  (authenticated)
export const logout = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { refreshTokenHash: null }) // invalidate server-side
  clearRefreshCookie(res)
  res.json({ message: 'Logged out' })
}

// GET /api/auth/me  (authenticated)
export const me = async (req, res) => {
  res.json({ user: req.user })
}
