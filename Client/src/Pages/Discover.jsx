import React, { useState, useMemo } from 'react'
import { Search, MapPin, UserPlus, UserCheck, Plus, Check, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dummyConnectionsData, dummyUserData } from '../assets/assets'

const Discover = () => {
  const navigate = useNavigate()
  const currentUser = dummyUserData

  const [input, setInput] = useState('')
  const [users] = useState(dummyConnectionsData)

  // Local state so the buttons respond instantly (replace with API data later)
  const [followingIds, setFollowingIds] = useState(currentUser.following)
  const [connectionIds] = useState(currentUser.connections)
  const [pendingIds, setPendingIds] = useState([])

  const originallyFollowing = currentUser.following

  const filteredUsers = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.bio.toLowerCase().includes(q) ||
        user.location.toLowerCase().includes(q)
    )
  }, [input, users])

  const handleFollowToggle = (userId) => {
    setFollowingIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
    // TODO: await api.post('/api/user/follow' or '/unfollow', { id: userId })
  }

  const handleConnectionRequest = (userId) => {
    if (pendingIds.includes(userId)) return
    setPendingIds((prev) => [...prev, userId])
    // TODO: await api.post('/api/user/connect', { id: userId })
  }

  // Followers count reflects the current user's follow / unfollow action
  const getFollowersCount = (user) => {
    const wasFollowing = originallyFollowing.includes(user._id)
    const isFollowing = followingIds.includes(user._id)
    let count = user.followers.length
    if (isFollowing && !wasFollowing) count += 1
    if (!isFollowing && wasFollowing) count -= 1
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
            </div>
          </div>
        </div>

        {/* Users */}
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
                <div className="text-center">
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="rounded-full w-16 h-16 object-cover shadow-md mx-auto"
                  />
                  <p className="mt-4 font-semibold text-slate-900">{user.full_name}</p>
                  {user.username && <p className="text-gray-500 font-light">@{user.username}</p>}
                  {user.bio && (
                    <p className="text-gray-600 mt-2 text-center text-sm px-4 whitespace-pre-line">
                      {user.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4" /> {user.location}
                  </div>
                  <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span>{getFollowersCount(user)}</span> Followers
                  </div>
                </div>

                <div className="flex mt-4 gap-2">
                  {/* Follow / Following */}
                  <button
                    type="button"
                    onClick={() => handleFollowToggle(user._id)}
                    className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
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
                      className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-slate-50"
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
                      className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-slate-50 disabled:cursor-default disabled:active:scale-100 disabled:hover:bg-transparent"
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

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <p className="text-center text-slate-500 mt-12">
            No people match "{input}". Try a different name, username or location.
          </p>
        )}
      </div>
    </div>
  )
}

export default Discover
