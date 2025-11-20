export type DrawActionState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

export const DRAW_INITIAL_STATE: DrawActionState = {
  status: 'idle',
  message: null,
}
