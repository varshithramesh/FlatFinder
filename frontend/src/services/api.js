const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
const TOKEN_KEY = 'flatfinder_access_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(payload?.detail || 'The request could not be completed.')
    error.status = response.status
    throw error
  }
  return payload
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  properties: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'Any') params.set(key, value)
    })
    return request(`/api/properties${params.toString() ? `?${params}` : ''}`)
  },
  property: (id) => request(`/api/properties/${id}`),
  flatmates: () => request('/api/flatmates'),
  flatmate: (id) => request(`/api/flatmates/${id}`),
  savedProperties: () => request('/api/me/saved-properties'),
  saveProperty: (id) => request(`/api/me/saved-properties/${id}`, { method: 'POST' }),
  unsaveProperty: (id) => request(`/api/me/saved-properties/${id}`, { method: 'DELETE' }),
  preferences: () => request('/api/me/preferences'),
  updatePreferences: (body) => request('/api/me/preferences', { method: 'PUT', body: JSON.stringify(body) }),
  visits: () => request('/api/me/visits'),
  createVisit: (propertyId, body) => request(`/api/me/visits?property_id=${encodeURIComponent(propertyId)}`, { method: 'POST', body: JSON.stringify(body) }),
  connectFlatmate: (id) => request(`/api/me/conversations/flatmate/${id}`, { method: 'POST' }),
  conversations: () => request('/api/me/conversations'),
  sendMessage: (id, body) => request(`/api/me/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
}
