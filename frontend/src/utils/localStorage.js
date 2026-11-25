export const STORAGE_KEYS = {
  user: 'flatfinder_user',
  savedProperties: 'flatfinder_saved_properties',
  preferences: 'flatfinder_preferences',
  messages: 'flatfinder_messages',
  visits: 'flatfinder_visits',
  quiz: 'flatfinder_quiz',
}

export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeStorage(key) {
  localStorage.removeItem(key)
}

export function getDemoUser() {
  return {
    fullName: 'Varshith',
    email: 'varshith@student.flatfinder.com',
    university: 'Alliance University',
    studentId: 'AU-2048',
    verified: true,
  }
}
