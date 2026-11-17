import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { ArrowLeft, ImageIcon, SendHorizonal, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'
import { fetchConnections } from '../features/connections/connectionsSlice'

const formatTime = (date) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

const ChatBox = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const currentUser = useSelector((state) => state.user.value)
  const messagesState = useSelector((state) => state.messages || state.message || {})
  const messages = Array.isArray(messagesState.messages) ? messagesState.messages : []

  const connectionsState = useSelector((state) => state.connections || state.connection || {})
  const connections = connectionsState.connections || []

  const [partner, setPartner] = useState(null)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null) // { file, preview }
  const [sending, setSending] = useState(false)

  // Resolve chat partner details
  useEffect(() => {
    const found = connections.find((u) => u._id === userId)
    if (found) {
      setPartner(found)
    } else {
      const loadPartner = async () => {
        try {
          const { data } = await api.post('/api/user/profiles', { profileId: userId })
          if (data && data.success && data.profile) {
            setPartner(data.profile)
          }
        } catch (err) {
          console.error('Error loading chat partner:', err)
        }
      }
      loadPartner()
    }
  }, [connections, userId])

  // Fetch connections if not yet loaded
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const token = await getToken()
        if (token) dispatch(fetchConnections(token))
      } catch (err) {
        console.error(err)
      }
    }
    if (connections.length === 0) {
      loadConnections()
    }
  }, [getToken, dispatch, connections.length])

  // Fetch messages between me and this user
  const fetchUserMessages = useCallback(async () => {
    try {
      const token = await getToken()
      if (token && userId) {
        dispatch(fetchMessages({ token, userId }))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [getToken, userId, dispatch])

  useEffect(() => {
    fetchUserMessages()
    return () => {
      dispatch(resetMessages())
    }
  }, [fetchUserMessages, dispatch])

  // Filter messages specifically belonging to this conversation
  const conversation = useMemo(() => {
    const currentId = currentUser?._id
    return messages
      .filter((m) => {
        if (!m || typeof m !== 'object') return false
        const fromId = typeof m.from_user_id === 'object' ? m.from_user_id?._id : m.from_user_id
        const toId = typeof m.to_user_id === 'object' ? m.to_user_id?._id : m.to_user_id
        return (
          (fromId === currentId && toId === userId) ||
          (fromId === userId && toId === currentId)
        )
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, [messages, currentUser?._id, userId])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.length])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (image) URL.revokeObjectURL(image.preview)
    setImage({ file, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview)
    setImage(null)
  }

  const sendMessage = async () => {
    if ((!text.trim() && !image) || sending) return

    try {
      setSending(true)
      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      if (text.trim()) formData.append('text', text.trim())
      if (image) formData.append('image', image.file)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data && data.success) {
        setText('')
        setImage(null)
        const newMsg = data.data || data.message
        if (newMsg && typeof newMsg === 'object') {
          dispatch(addMessage(newMsg))
        } else {
          // Re-fetch to ensure fresh state if object format varied
          fetchUserMessages()
        }
      } else {
        toast.error(data?.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend = (Boolean(text.trim()) || Boolean(image)) && !sending

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header with Back Arrow */}
      <div className="flex items-center gap-3 p-3 px-4 md:px-8 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          aria-label="Back to messages"
          title="Back to messages"
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <img
          src={partner?.profile_picture || '/default-avatar.png'}
          alt={partner?.full_name || 'User'}
          className="size-10 rounded-full object-cover border border-gray-200 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 leading-tight truncate">
            {partner?.full_name || 'Chat'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            @{partner?.username || userId}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:px-8 overflow-y-auto bg-slate-50">
        <div className="space-y-4 max-w-3xl mx-auto">
          {conversation.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              <p className="font-medium text-slate-700 mb-1">No messages yet</p>
              <p>Say hello to {partner?.full_name || 'your connection'}!</p>
            </div>
          ) : (
            conversation.map((message) => {
              const fromId =
                typeof message.from_user_id === 'object'
                  ? message.from_user_id?._id
                  : message.from_user_id
              const sentByMe = fromId === currentUser?._id
              const mediaSrc = Array.isArray(message.media_url)
                ? message.media_url[0]
                : message.media_url

              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${sentByMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 text-sm max-w-sm sm:max-w-md rounded-2xl shadow-sm ${
                      sentByMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    {message.message_type === 'image' && mediaSrc && (
                      <img
                        src={mediaSrc}
                        alt="Shared"
                        className="w-full max-w-sm rounded-lg mb-2 object-cover"
                      />
                    )}
                    {message.text && (
                      <p className="whitespace-pre-line break-words leading-relaxed">
                        {message.text}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-1">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          {image && (
            <div className="relative w-20 mb-2 ml-2">
              <img
                src={image.preview}
                alt="Upload preview"
                className="h-20 w-20 rounded-md object-cover shadow border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-0.5 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-slate-50 w-full border border-gray-300 shadow-sm rounded-full focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              className="flex-1 outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400"
              placeholder="Type a message..."
              onKeyDown={handleKeyDown}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />

            <label htmlFor="chat-image" className="cursor-pointer p-1" title="Attach image">
              <ImageIcon className="size-6 text-gray-400 hover:text-indigo-600 transition" />
              <span className="sr-only">Attach image</span>
            </label>
            <input
              type="file"
              id="chat-image"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
