'use client'

import { useRouter } from 'next/navigation'
import { Landing } from '@/components/landing'

export default function Page() {
  const router = useRouter()
  return <Landing onStart={() => router.push('/builder')} />
}
