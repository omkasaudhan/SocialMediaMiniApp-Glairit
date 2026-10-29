import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UserCard from './UserCard'

const ConnectionList = ({ users }) => {
  const navigate = useNavigate()

  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">No connections yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user}>
          <button
            type="button"
            onClick={() => navigate(`/messages/${user._id}`)}
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
