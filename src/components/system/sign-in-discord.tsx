"use client"

import { createClient } from '@/lib/supabase/client'
import React from 'react'
import { Button } from '../ui/button';

const SignInWithDiscord = ({ next }:{ next: string }) => {
  const supabase = createClient();

  async function action() {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/?next=${next}`,
      },
    })
  }
  return (
    <Button onClick={action}>Sign In With Discord</Button>
  )
}

export default SignInWithDiscord