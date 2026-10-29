import React from 'react'
import { useNavigate } from 'react-router-dom'

// Shared card used by Follower, Following, Pending and ConnectionList.
// Anything passed as children (extra action buttons) renders under "View Profile".
const UserCard = ({ user, children }) => {
  const navigate = useNavigate()

  return (
    <div className="w-full sm:w-80 flex gap-5 p-6 bg-white shadow rounded-md">
      <img
        src={user.profile_picture}
        alt={user.full_name}
        className="rounded-full size-12 shadow-md object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-700 truncate">{user.full_name}</p>
        <p className="text-slate-500 text-sm truncate">@{user.username}</p>
        {/* Newlines in the bio collapse to spaces, so it shows on one truncated line */}
        <p className="text-xs text-gray-600 truncate">{user.bio}</p>

        <div className="flex flex-col gap-2 mt-4">
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
