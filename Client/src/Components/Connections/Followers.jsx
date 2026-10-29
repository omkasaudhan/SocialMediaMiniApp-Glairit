import React from 'react'
import UserCard from './UserCard'

const Follower = ({ users }) => {
  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">No followers yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  )
}

export default Follower
