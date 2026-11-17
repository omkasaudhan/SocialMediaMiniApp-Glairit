import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, MapPin, UserPlus, UserCheck, Plus, Check, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Loading from '../Components/loading'
import api from '../api/axios'
import { useAuth } from '@clerk/react'
import { fetchUser } from '../features/user/userSlice'
import { fetchConnections } from '../features/connections/connectionsSlice'
import toast from 'react-hot-toast'

const Discover = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const currentUser = useSelector((state) => state.user.value)

  const [input, setInput] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const [followingIds, setFollowingIds] = useState([])
  const [connectionIds, setConnectionIds] = useState([])
  const [pendingIds, setPendingIds] = useState([])

  useEffect(() => {
    if (currentUser) {
      setFollowingIds(currentUser.following || [])
      setConnectionIds(currentUser.connections || [])
    }
  }, [currentUser])

  const fetchUsers = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) return

      const { data } = await api.post('/api/user/discover', { input: searchTerm }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data && data.success) {
        setUsers(data.users || [])
      } else {
        toast.error(data?.message || 'Failed to load users')
      }
    } catch (error) {
      console.error('Error fetching discover users:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    fetchUsers(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const filteredUsers = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (user) =>
        (user.full_name && user.full_name.toLowerCase().includes(q)) ||
        (user.username && user.username.toLowerCase().includes(q)) ||
        (user.bio && user.bio.toLowerCase().includes(q)) ||
        (user.location && user.location.toLowerCase().includes(q))
    )
  }, [input, users])

  const handleFollowToggle = async (userId) => {
    const isFollowing = followingIds.includes(userId)
    const endpoint = isFollowing ? '/api/user/unfollow' : '/api/user/follow'

    // Optimistic UI update
    setFollowingIds((prev) =>
      isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId]
    )

    try {
      const token = await getToken()
      const { data } = await api.post(endpoint, { id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data && data.success) {
        toast.success(data.message)
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      } else {
        // Revert on failure
        setFollowingIds((prev) =>
          isFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
        )
        toast.error(data?.message || 'Action failed')
      }
    } catch (error) {
      setFollowingIds((prev) =>
        isFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
      )
      toast.error(error.message)
    }
  }

  const handleConnectionRequest = async (userId) => {
    if (pendingIds.includes(userId)) return

    setPendingIds((prev) => [...prev, userId])
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/connect', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data && data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(token))
      } else {
        setPendingIds((prev) => prev.filter((id) => id !== userId))
        toast.error(data?.message || 'Connection request failed')
      }
    } catch (error) {
      setPendingIds((prev) => prev.filter((id) => id !== userId))
      toast.error(error.message)
    }
  }

  const getFollowersCount = (user) => {
    const baseCount = (user.followers || []).length
    const originallyWasFollowing = currentUser?.following?.includes(user._id)
    const isNowFollowing = followingIds.includes(user._id)

    let count = baseCount
    if (isNowFollowing && !originallyWasFollowing) count += 1
    if (!isNowFollowing && originallyWasFollowing) count = Math.max(0, count - 1)
    return count
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
          <p className="text-slate-600">Connect with amazing people and grow your network</p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="pl-10 sm:pl-12 pr-24 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                value={input}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 flex justify-center">
            <Loading />
          </div>
        )}

        {/* Users */}
        {!loading && (
          <div className="flex flex-wrap gap-6">
            {filteredUsers.map((user) => {
              const isFollowing = followingIds.includes(user._id)
              const isConnected = connectionIds.includes(user._id)
              const isPending = pendingIds.includes(user._id)

              return (
                <div
                  key={user._id}
                  className="w-full sm:w-72 p-4 pt-6 flex flex-col justify-between bg-white shadow border border-gray-200 rounded-md"
                >
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <img
                      src={user.profile_picture || '/default-avatar.png'}
                      alt={user.full_name || 'User'}
                      className="rounded-full w-16 h-16 object-cover shadow-md mx-auto"
                    />
                    <p className="mt-4 font-semibold text-slate-900 hover:text-indigo-600 transition">
                      {user.full_name || 'Anonymous User'}
                    </p>
                    {user.username && <p className="text-gray-500 font-light text-sm">@{user.username}</p>}
                    {user.bio && (
                      <p className="text-gray-600 mt-2 text-center text-sm px-4 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                    {user.location && (
                      <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                        <MapPin className="w-3.5 h-3.5" /> {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                      <span>{getFollowersCount(user)}</span> Followers
                    </div>
                  </div>

                  <div className="flex mt-4 gap-2">
                    {/* Follow / Following */}
                    <button
                      type="button"
                      onClick={() => handleFollowToggle(user._id)}
                      className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white text-sm cursor-pointer"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" /> Follow
                        </>
                      )}
                    </button>

                    {/* Message (if connected) or connection request */}
                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/messages/${user._id}`)}
                        aria-label={`Message ${user.full_name}`}
                        title="Send message"
                        className="flex items-center justify-center w-14 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-slate-50"
                      >
                        <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnectionRequest(user._id)}
                        disabled={isPending}
                        aria-label={isPending ? 'Connection request sent' : 'Send connection request'}
                        title={isPending ? 'Request sent' : 'Connect'}
                        className="flex items-center justify-center w-14 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-slate-50 disabled:cursor-default disabled:active:scale-100 disabled:hover:bg-transparent"
                      >
                        {isPending ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200 mt-6">
            <p className="text-slate-700 font-medium text-lg mb-1">No people found</p>
            <p className="text-slate-500 text-sm">
              {input
                ? `No people match "${input}". Try searching for another name, username or location.`
                : 'There are no other registered users yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
