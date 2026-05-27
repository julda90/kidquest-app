import { apiFetch } from './client'

export const getTransactionsByChild    = (childId)       => apiFetch(`/api/pointTransactions/child/${childId}`)
export const createPointTransaction    = (childId, data) => apiFetch(`/api/pointTransactions/child/${childId}`, { method: 'POST', body: JSON.stringify(data) })
