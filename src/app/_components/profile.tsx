"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import React from 'react'

const Profile = ({ user }:{ user: User }) => {
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='cursor-pointer'>
          <AvatarImage src={user.user_metadata["avatar_url"]} />
          <AvatarFallback>{user.user_metadata["full_name"].slice(0, 2) || "A"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Profile