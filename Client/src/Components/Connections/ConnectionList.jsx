import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UserCard from './UserCard'
import api from '../../api/axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const ConnectionList = ({ users }) => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const currentUser = useSelector((state)=>state.user.value)
  
  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">No connections yet.</p>
  }

   const handleConnectionRequest = async (user) =>{
    if(currentUser.connections.includes(user._id)){
      return navigate(`/messages/'${user._id}`)
    }
    try {
      const { data } = await api.post('/api/user/connect', {id:user._id}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  return (
    <div className="flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user}>
          <button
            type="button"
            onClick={()=>{handleConnectionRequest(user)}}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
        </UserCard>
      ))}
    </div>
  )
}

export default ConnectionList
