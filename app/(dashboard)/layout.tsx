import TopBar from '@/components/layout/topbar'
import React from 'react'

const DashboardLayout = ({ children }:{children: React.ReactNode}) => {
  return (
    <div>
        <TopBar />
        <div className='pt-16'>
          {children}
        </div>
    </div>
  )
}

export default DashboardLayout