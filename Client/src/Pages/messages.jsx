import { useEffect } from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import { fetchConnections } from '../features/connections/connectionsSlice'

const Messages = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { getToken } = useAuth()

  const connectionsState = useSelector((state) => state.connections || state.connection || {})
  const connections = connectionsState.connections || []

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const token = await getToken()
        if (token) {
          dispatch(fetchConnections(token))
        }
      } catch (err) {
        console.error("Error loading connections in Messages:", err)
      }
    }
    loadConnections()
  }, [getToken, dispatch])

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected users */}
        <div className="flex flex-col gap-3">
          {connections.length === 0 ? (
            <div className="max-w-xl p-8 bg-white shadow rounded-md text-center text-slate-500">
              <p className="font-semibold text-slate-700 text-lg mb-1">No connections yet</p>
              <p className="text-sm">Connect with other users to start chatting!</p>
            </div>
          ) : (
            connections.map((user) => (
              <div
                key={user._id}
                className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md"
              >
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.full_name || 'User'}
                  className="rounded-full size-12 mx-auto object-cover"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700">{user.full_name}</p>
                  <p className="text-slate-500">@{user.username}</p>
                  {user.bio && <p className="text-sm text-gray-600 whitespace-pre-line">{user.bio}</p>}
                </div>

                <div className="flex flex-row sm:flex-col gap-2 mt-4 sm:mt-0 max-sm:w-full max-sm:justify-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/messages/${user._id}`)}
                    aria-label={`Message ${user.full_name}`}
                    title="Send message"
                    className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${user._id}`)}
                    aria-label={`View ${user.full_name}'s profile`}
                    title="View profile"
                    className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
