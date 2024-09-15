import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Terminal } from 'lucide-react'
import { Button } from '../ui/button'
import { DISCORD_INVITE_URL } from '@/lib/config'

const JoinDiscord = () => {
  return (
    <Alert className='m-4 w-fit'>
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
  )
}

export default JoinDiscord