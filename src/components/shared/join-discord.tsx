import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { MessageCircle, Terminal } from 'lucide-react'
import { Button } from '../ui/button'
import { DISCORD_INVITE_URL } from '@/lib/config'

const JoinDiscord = () => {
  return (
    <Alert className='m-4 space-x-2 w-fit rounded-none rounded-r-lg border-l-8 dark:border-blue-400 border-blue-600'>
      <MessageCircle className='size-6 dark:stroke-blue-400 stroke-blue-600' />
      <AlertTitle>Join our Discord Community</AlertTitle>
      <AlertDescription>
        <p className='mb-2'>
          Connect with like-minded individuals, participate in discussions, and stay up-to-date with the latest news and updates.
          You can also request for translation of other novels.
        </p>
        <Button className='bg-blue-600 dark:bg-blue-400 no-underline' asChild><a href={DISCORD_INVITE_URL}>Join Now</a></Button>
      </AlertDescription>
    </Alert>
  )
}

export default JoinDiscord