import React from 'react'
import Navbar from '../_components/navbar'
import GoogleAdsenseWrapper from '@/components/system/google-adsense-wrapper'
import { FooterComponent } from '@/components/footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1024px] mx-auto flex flex-col min-h-screen bg-pattern dark:bg-vignette">
      <GoogleAdsenseWrapper pId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || ""} />
      <Navbar />
      <main className='flex-grow mx-4'>
        {children}
      </main>
      <FooterComponent />
    </div>
  )
}

