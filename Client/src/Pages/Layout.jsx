import { Menu, X } from 'lucide-react'
import SideBar from '../Components/SideBar'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/react'
import { fetchUser } from '../features/user/userSlice'

const Layout = () => {
  const user = useSelector((state) => state.user.value)
  const loading = useSelector((state) => state.user.loading)
  const error = useSelector((state) => state.user.error)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const handleRetry = async () => {
    try {
      const token = await getToken()
      if (token) {
        dispatch(fetchUser(token))
      }
    } catch (err) {
      console.error("Retry failed:", err)
    }
  }

  if (user) {
    return (
      <div className='w-full flex h-screen'>
        <SideBar sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen}/>
        <div className='flex-1 p-4 bg-slate-50'>
          <Outlet />
        </div>
        {isSidebarOpen ? 
          <X className='absolute top-4 right-4 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' size={24} onClick={() => setIsSidebarOpen(false)}/> 
          :
          <Menu className='absolute top-4 right-4 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' size={24} onClick={() => setIsSidebarOpen(true)}/>
        }
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4 bg-slate-50'>
      <div className='w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
      <p className='text-gray-600 font-medium'>
        {loading ? 'Setting up your profile...' : 'Loading profile...'}
      </p>
      {error && (
        <div className='flex flex-col items-center gap-2 mt-2'>
          <p className='text-sm text-red-500'>Failed to load profile: {error}</p>
          <button 
            onClick={handleRetry} 
            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition cursor-pointer'
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default Layout
