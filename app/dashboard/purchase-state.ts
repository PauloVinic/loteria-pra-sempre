export type PurchaseActionStatus = 'idle' | 'success' | 'error'

export type PurchaseActionFieldErrors = {
  quantity?: string
}

export type PurchaseActionState = {
  status: PurchaseActionStatus
  message?: string
  fieldErrors?: PurchaseActionFieldErrors
  code?: 'INSUFFICIENT_FUNDS' | 'INVALID_INPUT' | 'SESSION_NOT_FOUND' | 'INTERNAL_ERROR'
}

export const PURCHASE_INITIAL_STATE: PurchaseActionState = {
  status: 'idle',
}
