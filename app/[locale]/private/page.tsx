import { redirect } from 'next/navigation'

import { createClient } from '@/src/utils/supabase/server'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  console.log(data, error)
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return <p>Hello {data.user.email}</p>
}