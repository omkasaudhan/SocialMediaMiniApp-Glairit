import { Menu, X } from 'lucide-react'
import SideBar from '../Components/SideBar'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { dummyUserData } from '../assets/assets'

const Layout = () => {
  const user = dummyUserData
  const[isSidebarOpen, setSidebarOpen] = useState(false)
  return user ? (
    <div className='w-full flex h-screen'>
      <SideBar sidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className='flex-1 p-4 bg-slate-50'>
        <Outlet />
      </div>
      {isSidebarOpen ? 
      <X className='absolute top-4 right-4 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' size={24} onClick={() => setIsSidebarOpen(false)}/> 
      :
      <Menu className='absolute top-4 right-4 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' size={24} onClick={() => setIsSidebarOpen(true)}/>
      }
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <p className='text-gray-500 text-lg'>Loading...</p>
    </div>
  )
}

export default Layout