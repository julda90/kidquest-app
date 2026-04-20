import { apiFetch } from './client'

export const getMe = () => apiFetch('/api/users/me')
