import React from 'react'
import Navbar from '../_components/navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}

