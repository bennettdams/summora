import { signOut as signOutNextAuth, useSession } from 'next-auth/react'

export function useAuth() {
  const { data: sessionData, status } = useSession()

  async function signOut() {
    return await signOutNextAuth()
  }

  return {
    isLoadingAuth: status === 'loading',
    userIdAuth: sessionData?.user?.id ?? null,
    signOut,
  }
}
