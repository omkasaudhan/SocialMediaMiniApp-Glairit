import React from 'react'
import UserCard from './UserCard'

const Pending = ({ users, onAccept }) => {
  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">No pending connection requests.</p>
  }

  return (
    <div className="flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user}>
          <button
            type="button"
            onClick={() => onAccept(user._id)}
            className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer"
          >
            Accept
          </button>
        </UserCard>
      ))}
    </div>
  )
}

export default Pending
