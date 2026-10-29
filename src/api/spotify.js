import { getAccessToken, refreshToken, logout } from './auth'

const BASE = 'https://api.spotify.com/v1'
const MAX_RATE_LIMIT_RETRIES = 3

async function request(path, options = {}, authRetried = false, rateLimitRetries = 0) {
  let token
  try {
    token = await getAccessToken()
  } catch (error) {
    logout()
    throw new Error('Your Spotify session has expired. Please log in again.', { cause: error })
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 204 || res.status === 202) return null

  if (res.status === 401 && !authRetried) {
    try {
      await refreshToken()
    } catch (error) {
      logout()
      throw new Error('Your Spotify session has expired. Please log in again.', { cause: error })
    }
    return request(path, options, true, rateLimitRetries)
  }

  if (res.status === 429 && rateLimitRetries < MAX_RATE_LIMIT_RETRIES) {
    const retryAfter = Number(res.headers.get('Retry-After'))
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 30) : 1
    await new Promise(resolve => setTimeout(resolve, wait * 1000))
    return request(path, options, authRetried, rateLimitRetries + 1)
  }

  if (!res.ok) {
    let message
    try {
      message = (await res.json())?.error?.message
    } catch {
      message = undefined
    }
    const error = new Error(message || `Spotify API error ${res.status}`)
    error.status = res.status
    throw error
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

const boundedLimit = limit => Math.min(50, Math.max(1, Math.floor(Number(limit) || 50)))
const encodeId = id => encodeURIComponent(id)

export function tracksFrom(container) {
  const list = container?.items ?? []
  return list
    .map(item => item?.track ?? item?.item ?? item)
    .filter(track => track && track.id && track.type !== 'episode')
}

export const getMe = () => request('/me')
export const getMyPlaylists = (limit = 50) => request(`/me/playlists?limit=${boundedLimit(limit)}`)
export const getSavedTracks = (limit = 50) => request(`/me/tracks?limit=${boundedLimit(limit)}`)
export const getTopTracks = (limit = 10) =>
  request(`/me/top/tracks?limit=${boundedLimit(limit)}&time_range=medium_term`)
export const getRecentlyPlayed = (limit = 20) => request(`/me/player/recently-played?limit=${boundedLimit(limit)}`)

export const getNewReleases = (limit = 10) => request(`/browse/new-releases?limit=${boundedLimit(limit)}`)
export const getAlbum = id => request(`/albums/${encodeId(id)}`)
export const getArtist = id => request(`/artists/${encodeId(id)}`)
export const getArtistTopTracks = (id, market = 'US') =>
  request(`/artists/${encodeId(id)}/top-tracks?market=${encodeURIComponent(market)}`)
export const getArtistAlbums = (id, limit = 10) =>
  request(`/artists/${encodeId(id)}/albums?include_groups=album,single&limit=${boundedLimit(limit)}`)
export const getPlaylist = id =>
  request(`/playlists/${encodeId(id)}?fields=id,name,description,images,owner(display_name),uri,followers(total)`)

export async function getPlaylistItems(id, limit = 50) {
  const bounded = boundedLimit(limit)
  try {
    return await request(`/playlists/${encodeId(id)}/items?limit=${bounded}`)
  } catch (error) {
    if (error.status !== 404) throw error
    return request(`/playlists/${encodeId(id)}/tracks?limit=${bounded}`)
  }
}

export const search = (query, types = 'track,artist,album,playlist') =>
  request(`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(types)}&limit=10`)

export const startPlayback = (body, deviceId) =>
  request(`/me/player/play${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
