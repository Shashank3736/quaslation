import React from 'react'
import Navbar from '../_components/navbar'
// import GoogleAdsense from '@/components/system/google-adsense'
import { FooterComponent } from '@/components/footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1000px] mx-auto">
      {/* <GoogleAdsense pId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || ""} /> */}
      <Navbar />
      {children}
      <FooterComponent />
    </div>
  )
}

