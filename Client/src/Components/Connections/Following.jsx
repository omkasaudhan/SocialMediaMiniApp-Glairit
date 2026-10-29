import React from 'react'
import UserCard from './UserCard'

const Following = ({ users, onUnfollow }) => {
  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">You are not following anyone yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user}>
          <button
            type="button"
            onClick={() => onUnfollow(user._id)}
            className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer"
          >
            Unfollow
          </button>
        </UserCard>
      ))}
    </div>
  )
}

export default Following
