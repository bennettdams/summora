import { isServer } from '../util/utils'
import { deleteUserSupabase } from './supabase/supabase-service'

export async function deleteUser(userId: string): Promise<void> {
  if (!isServer()) {
    throw new Error(`${deleteUser.name} can only be used on the server.`)
  } else {
    await deleteUserSupabase(userId)
  }
}
