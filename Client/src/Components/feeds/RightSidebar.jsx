import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import TimeAgo from './TimeAgo'
import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const RightSidebar = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const { user } = useUser()
  const { getToken } = useAuth()

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get('/api/user/recent-messages', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        const rawList = Array.isArray(data.messages)
          ? data.messages
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.message)
              ? data.message
              : []

        const groupedMessages = rawList.reduce((acc, message) => {
          if (!message) return acc
          const otherUser = message.from_user_id?._id === user?.id 
            ? message.to_user_id 
            : message.from_user_id
          const otherUserId = otherUser?._id || otherUser
          if (otherUserId && (!acc[otherUserId] || new Date(message.createdAt) > new Date(acc[otherUserId].createdAt))) {
            acc[otherUserId] = { ...message, chatPartner: otherUser }
          }
          return acc
        }, {})

        const sortedMessages = Object.values(groupedMessages).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setMessages(sortedMessages)
      } else if (data?.message) {
        console.warn('Could not fetch recent messages:', data.message)
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error)
    }  
  }
  
  useEffect(() => {
    if (user) {
      fetchRecentMessages()
      const intervalid = setInterval(fetchRecentMessages, 30000)
      return () => { clearInterval(intervalid) }
    }
  }, [user])

  return (
    <aside className="max-xl:hidden sticky top-6 w-72 shrink-0 space-y-4">
      {/* Sponsored */}
      <div className="bg-white p-3 rounded-md shadow space-y-2">
        <h3 className="text-slate-800 font-semibold text-sm">Sponsored</h3>
        <img src={assets.sponsored_img} alt="Sponsored" className="w-full h-44 object-cover rounded-md" />
        <p className="text-slate-600 text-sm">Email marketing</p>
        <p className="text-slate-400 text-xs">
          Supercharge your marketing with a powerful, easy-to-use platform built for results.
        </p>
      </div>

      {/* Recent messages */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Recent Messages</h3>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No recent messages</p>
          ) : (
            messages.map((message) => {
              const partner = message.chatPartner || message.from_user_id || {}
              const partnerId = partner._id || partner
              return (
                <button
                  key={message._id}
                  type="button"
                  onClick={() => navigate(`/messages/${partnerId}`)}
                  className="flex items-start gap-2 py-2 px-1 rounded hover:bg-slate-100 text-left cursor-pointer"
                >
                  <img src={partner.profile_picture || assets.sample_user} alt="" className="size-8 rounded-full object-cover" />
                  <div className="w-full min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-xs text-slate-800 truncate">{partner.full_name || 'User'}</p>
                      <p className="text-[10px] text-slate-400 shrink-0">{TimeAgo(message.createdAt)}</p>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">
                        {message.text ? message.text : 'Media'}
                      </p>
                      {!message.seen && (
                        <span className="bg-indigo-500 text-white size-4 flex items-center justify-center text-[10px] rounded-full shrink-0">
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}

export default RightSidebar
