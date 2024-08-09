import React from 'react'
import Navbar from '../_components/navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1000px] mx-auto">
      <Navbar />
      {children}
    </div>
  )
}

