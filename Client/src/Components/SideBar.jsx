import React from 'react'
import { assets ,dummyUserData} from '../assets/assets'
import {useNavigate ,Link} from 'react-router-dom'
import MenuItem from './MenuItem'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/react'

const SideBar = ({setSideBarOpen}) => {
    const navigate = useNavigate()
    const user = dummyUserData
    const {signOut} = useClerk()
  return (
    <div className="w-60 xl:w-72 bg-white border-grey-200  flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full} transiton-all duration-300 ease-in-out">
        <div className='w-full'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-26 ml-7 my-2 cursor-pointer' />
            <hr className='border-gray-300 my-2' />
            <MenuItem setSidebarOpen={setSideBarOpen} />
            <Link to="/create-post" className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:to-purple-800 transition text-white curser-pointer'>
                <CirclePlus className='w-5 h-5' />
                Create Post
            </Link>
        </div> 
        <div className='w-full border-t border-grey-200 p-4 px-7 flex item-center justify-between'> 
                <div className='flex justify-center items-center curser-pointer gap-2'>
                    <UserButton />
                    <div>
                        <h1 className='text-sm font-bold text-lg'>{user.full_name}</h1>
                        <p className='text-xs text-gray-500'>@{user.username}</p>
                    </div>
                </div> 
                <LogOut className='w-5 text-grey-400 hover:text-grey-00 transition cursor-pointer' onClick={signOut} />   
        </div>        
    </div>
  )
}

export default SideBar