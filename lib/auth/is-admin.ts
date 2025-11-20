export const ADMINS = ["paulo_vinicius_21@hotmail.com"]

export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  return ADMINS.includes(email.toLowerCase())
}
