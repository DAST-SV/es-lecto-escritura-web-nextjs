import { redirect } from 'next/navigation'

import { createClient } from '@/src/utils/supabase/server'
import UnifiedLayout from '@/src/components/nav/UnifiedLayout'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  console.log(data, error)
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return <UnifiedLayout>Hello {data.user.email}</UnifiedLayout>
}