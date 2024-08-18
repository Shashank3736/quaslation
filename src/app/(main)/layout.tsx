import React from 'react'
import Navbar from '../_components/navbar'
import { SetOrganization } from '@/components/system/clerk-organization'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DISCORD_INVITE_URL } from '@/lib/config'
import { Terminal } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1000px] mx-auto">
      <Navbar />
      <Alert className='m-4'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Join our Discord Community</AlertTitle>
        <AlertDescription>
          <p className='mb-2'>
            Connect with like-minded individuals, participate in discussions, and stay up-to-date with the latest news and updates.
            You can also request for translation of other novels.
          </p>
          <Button asChild><a href={DISCORD_INVITE_URL}>Join Now</a></Button>
        </AlertDescription>
      </Alert>
      {children}
      <SetOrganization />
    </div>
  )
}

