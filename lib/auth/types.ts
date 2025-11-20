export type AuthActionStatus = 'idle' | 'success' | 'error'

export type AuthFieldErrors = {
  email?: string
  password?: string
  fullName?: string
}

export type AuthActionState = {
  status: AuthActionStatus
  message?: string
  fieldErrors?: AuthFieldErrors
}

export const AUTH_ACTION_INITIAL_STATE: AuthActionState = {
  status: 'idle',
}
