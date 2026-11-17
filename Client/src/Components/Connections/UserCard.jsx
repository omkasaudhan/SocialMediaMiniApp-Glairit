import { useAuth } from '@clerk/react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../../features/user/userSlice'
import { UserPlus } from 'lucide-react'

// Shared card used by Follower, Following, Pending and ConnectionList.
// Anything passed as children (extra action buttons) renders under "View Profile".
const UserCard = ({ user, children }) => {
  const navigate = useNavigate()
  const currentUser = useSelector((state)=>state.user.value)
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const handleFollow = async () =>{
    try {
      const { data } = await api.post('/api/user/follow', {id:user._id}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchUser(await getToken()))
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="w-full sm:w-80 flex gap-5 p-6 bg-white shadow rounded-md">
      <img
        src={user.profile_picture}
        alt={user.full_name}
        onClick={() => navigate(`/profile/${user._id}`)}
        className="rounded-full size-12 shadow-md object-cover shrink-0 cursor-pointer hover:opacity-90 transition"
      />

      <div className="flex-1 min-w-0">
        <p
          onClick={() => navigate(`/profile/${user._id}`)}
          className="font-medium text-slate-700 truncate cursor-pointer hover:underline"
        >
          {user.full_name}
        </p>
        <p
          onClick={() => navigate(`/profile/${user._id}`)}
          className="text-slate-500 text-sm truncate cursor-pointer hover:underline"
        >
          @{user.username}
        </p>
        {/* Newlines in the bio collapse to spaces, so it shows on one truncated line */}
        <p className="text-xs text-gray-600 truncate">{user.bio}</p>

        <div className="flex flex-col gap-2 mt-4">
          <button onClick={handleFollow} disabled={currentUser?.following?.includes(user._id)} className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
              <UserPlus className='w-4 h-4'/> {currentUser?.following?.includes(user._id) ? 'following': 'follow'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(`/profile/${user._id}`)}
            className="w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
          >
            View Profile
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

export default UserCard
