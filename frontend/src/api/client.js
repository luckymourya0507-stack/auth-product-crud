// One place that talks to the backend.
//
// Token handling:
//  - The ACCESS token lives only in this variable (memory). It is gone on page reload,
//    which is intentional: it is short-lived and we can always get a new one.
//  - The REFRESH token lives in an httpOnly cookie that JavaScript cannot read. The browser
//    sends it automatically (credentials: 'include') to /api/auth/refresh-token.

const BASE = `${import.meta.env.VITE_API_URL || ''}/api`

let accessToken = null
let refreshPromise = null // shared so several parallel 401s trigger only ONE refresh call
let onAuthFailure = () => {} // AuthContext registers a callback to log the user out in the UI

export const setAccessToken = (token) => {
  accessToken = token
}
export const setOnAuthFailure = (fn) => {
  onAuthFailure = fn
}

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.status = status
    this.errors = errors // field-level errors from express-validator: [{ field, message }]
  }
}

// Asks the server for a new access token using the refresh cookie.
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh-token`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new ApiError('Session expired', res.status)
        const data = await res.json()
        accessToken = data.accessToken
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function send(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  return fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

// Main helper used by the app.
// If a request returns 401 we try ONE silent refresh, then repeat the request.
// If the refresh also fails, the session is over: tell the UI to log out.
export async function api(path, options = {}) {
  let res = await send(path, options)

  const canRetry = res.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')
  if (canRetry) {
    try {
      await refreshAccessToken()
      res = await send(path, options)
    } catch {
      setAccessToken(null)
      onAuthFailure()
      throw new ApiError('Session expired. Please log in again.', 401)
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Request failed', res.status, data.errors)
  return data
}
