import { apiFetch } from './client'

export const redeemReward       = (childId, rewardId)    => apiFetch(`/api/redemptions/child/${childId}/reward/${rewardId}`, { method: 'POST' })
export const approveRedemption  = (redemptionId)         => apiFetch(`/api/redemptions/${redemptionId}/approve`,             { method: 'POST' })
export const deliverRedemption  = (redemptionId)         => apiFetch(`/api/redemptions/${redemptionId}/deliver`,             { method: 'POST' })
export const cancelRedemption   = (redemptionId)         => apiFetch(`/api/redemptions/${redemptionId}/cancel`,              { method: 'POST' })
export const getRedemptionsByChild  = (childId)          => apiFetch(`/api/redemptions/child/${childId}`)
export const getRedemptionsByFamily = (familyId, status) =>
  apiFetch(`/api/redemptions/family/${familyId}${status ? `?status=${status}` : ''}`)
