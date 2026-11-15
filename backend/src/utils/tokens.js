import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const isProd = process.env.NODE_ENV === 'production'

// Access token: short-lived, sent in the JSON body, used in the Authorization header.
export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId.toString() }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  })

// Refresh token: long-lived, signed with a DIFFERENT secret, sent as an httpOnly cookie.
// "jti" is a random id so two tokens issued in the same second are still different.
export const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId.toString(), jti: crypto.randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  })

export const verifyAccessToken = (token) => jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

// We store only a SHA-256 hash of the refresh token in the DB, so a leaked database
// does not leak usable tokens.
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// httpOnly  -> JavaScript in the page cannot read the cookie (protects against XSS theft)
// secure    -> only sent over HTTPS in production
// path      -> cookie is only sent to /api/auth/* routes, not to every request
export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  path: '/api/auth',
}

export const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, { ...refreshCookieOptions, maxAge: SEVEN_DAYS_MS })

export const clearRefreshCookie = (res) => res.clearCookie('refreshToken', refreshCookieOptions)
