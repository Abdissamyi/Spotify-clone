const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = import.meta.env.VITE_REDIRECT_URI
const TOKEN_URL = 'https://accounts.spotify.com/api/token'

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ')

let refreshRequest

function assertConfiguration() {
  if (!clientId || !redirectUri) {
    throw new Error('Set VITE_SPOTIFY_CLIENT_ID and VITE_REDIRECT_URI in your .env file.')
  }
}

function randomString(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(x => chars[x % chars.length])
    .join('')
}

async function challengeFrom(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function saveTokens(data) {
  if (!data?.access_token) {
    throw new Error(data?.error_description || data?.error?.message || 'Spotify token request failed.')
  }

  const expiresIn = Number(data.expires_in)
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error('Spotify returned an invalid token expiration.')
  }

  localStorage.setItem('access_token', data.access_token)
  if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
  localStorage.setItem('expires_at', String(Date.now() + expiresIn * 1000))
}

async function requestTokens(body) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Spotify token request failed (${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error?.message || `Spotify token request failed (${response.status}).`)
  }

  saveTokens(data)
}

export async function login() {
  assertConfiguration()
  const verifier = randomString()
  const state = randomString(16)
  localStorage.setItem('code_verifier', verifier)
  localStorage.setItem('oauth_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: await challengeFrom(verifier),
    state,
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCode(code, state) {
  assertConfiguration()
  const expectedState = localStorage.getItem('oauth_state')
  const verifier = localStorage.getItem('code_verifier')
  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    throw new Error('Spotify login could not be verified. Please try again.')
  }

  await requestTokens({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  })
  localStorage.removeItem('code_verifier')
  localStorage.removeItem('oauth_state')
}

export async function refreshToken() {
  if (refreshRequest) return refreshRequest

  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('No refresh token is available.')
  assertConfiguration()

  refreshRequest = requestTokens({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refresh,
  })

  try {
    await refreshRequest
  } finally {
    refreshRequest = undefined
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}

export async function getAccessToken() {
  const token = localStorage.getItem('access_token')
  const expiresAt = Number(localStorage.getItem('expires_at') || 0)
  if (!token || Date.now() >= expiresAt - 60_000) {
    await refreshToken()
  }

  const currentToken = localStorage.getItem('access_token')
  if (!currentToken) throw new Error('No access token is available.')
  return currentToken
}

export function logout() {
  ;['access_token', 'refresh_token', 'expires_at', 'code_verifier', 'oauth_state'].forEach(key =>
    localStorage.removeItem(key),
  )
  window.location.href = '/login'
}
