import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal, X } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { dummyConnectionsData, dummyMessagesData } from '../assets/assets'


const CURRENT_USER_ID = 'user_2zwZSCMRXQ9GaEEVLgm6akQo96i'

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const ChatBox = () => {
  const { userId } = useParams()
  const messagesEndRef = useRef(null)

  const [text, setText] = useState('')
  const [image, setImage] = useState(null) // { file, preview }
  const [messages, setMessages] = useState(dummyMessagesData)

  // The person you are chatting with
  const user = dummyConnectionsData.find((u) => u._id === userId) || dummyConnectionsData[0]

  // Only messages between me and this user, oldest first
  const conversation = useMemo(
    () =>
      messages
        .filter(
          (m) =>
            (m.from_user_id === CURRENT_USER_ID && m.to_user_id === user._id) ||
            (m.from_user_id === user._id && m.to_user_id === CURRENT_USER_ID)
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages, user._id]
  )

  // Scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.length])

  // Release the preview URL on unmount
  useEffect(() => {
    return () => image && URL.revokeObjectURL(image.preview)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const sendMessage = () => {
    if (!text.trim() && !image) return

    const now = new Date().toISOString()
    const newMessage = {
      _id: `local_${Date.now()}`,
      from_user_id: CURRENT_USER_ID,
      to_user_id: user._id,
      text: text.trim(),
      message_type: image ? 'image' : 'text',
      media_url: image ? image.preview : '',
      seen: false,
      createdAt: now,
      updatedAt: now,
    }

    // TODO: replace with your API call, e.g.
    // const fd = new FormData(); fd.append('to_user_id', user._id); fd.append('text', text); image && fd.append('image', image.file)
    // await api.post('/api/message/send', fd)
    setMessages((prev) => [...prev, newMessage])
    setText('')
    setImage(null) // preview URL stays alive because the message uses it
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend = text.trim() || image

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img src={user.profile_picture} alt={user.full_name} className="size-8 rounded-full object-cover" />
        <div>
          <p className="font-medium leading-tight">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 md:px-10 overflow-y-scroll bg-slate-50">
        <div className="space-y-4 max-w-4xl mx-auto">
          {conversation.length === 0 && (
            <p className="text-center text-sm text-slate-500 mt-10">
              No messages yet. Say hello to {user.full_name}.
            </p>
          )}

          {conversation.map((message) => {
            const sentByMe = message.from_user_id === CURRENT_USER_ID
            return (
              <div
                key={message._id}
                className={`flex flex-col ${sentByMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                    sentByMe ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {message.message_type === 'image' && message.media_url && (
                    <img
                      src={message.media_url}
                      alt="Shared"
                      className="w-full max-w-sm rounded-lg mb-1"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-5 bg-slate-50">
        <div className="max-w-xl mx-auto">
          {image && (
            <div className="relative w-20 mb-2 ml-3">
              <img src={image.preview} alt="To send" className="h-20 w-20 rounded-md object-cover shadow" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full border border-gray-200 shadow rounded-full">
            <input
              type="text"
              className="flex-1 outline-none text-slate-700 text-sm"
              placeholder="Type a message..."
              onKeyDown={handleKeyDown}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />

            <label htmlFor="chat-image" className="cursor-pointer" title="Attach image">
              <ImageIcon className="size-7 text-gray-400 hover:text-gray-600 transition" />
              <span className="sr-only">Attach image</span>
            </label>
            <input type="file" id="chat-image" accept="image/*" hidden onChange={handleImageChange} />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full transition disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
