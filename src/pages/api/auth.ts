/**
 * NOTE: this file is needed for SSR (getServerSideProps)
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../services/supabase/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  supabase.auth.api.setAuthCookie(req, res)
}
