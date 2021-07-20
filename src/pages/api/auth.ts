/**
 * NOTE: this file is needed for SSR (getServerSideProps)
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { setAuthCookie } from '../../services/supabase/supabase-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  setAuthCookie(req, res)
}
