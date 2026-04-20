import { apiFetch } from './client'

export const getTransactionsByChild = (childId) => apiFetch(`/api/pointTransactions/child/${childId}`)
