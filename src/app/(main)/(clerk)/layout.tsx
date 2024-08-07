import React from 'react'

export default function ClerkLayout({ children }:{ children: React.ReactNode }) {
  return (
    <div className='flex items-center justify-center my-4'>
      {children}
    </div>
  )
}
