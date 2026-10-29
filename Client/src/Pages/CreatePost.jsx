import React, { useState, useEffect } from 'react'
import { Image, X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dummyUserData } from '../assets/assets'

const MAX_IMAGES = 4

const CreatePost = () => {
  const navigate = useNavigate()
  const user = dummyUserData

  const [content, setContent] = useState('')
  const [images, setImages] = useState([]) // [{ file, preview }]
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'error' | 'success', text }

  // Free object URLs when the component unmounts
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - images.length

    if (files.length > remaining) {
      setStatus({ type: 'error', text: `You can add up to ${MAX_IMAGES} images.` })
    } else {
      setStatus(null)
    }

    const next = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...next])
    e.target.value = '' // allows re-selecting the same file
  }

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handlePublish = async () => {
    if (!content.trim() && images.length === 0) {
      setStatus({ type: 'error', text: 'Add some text or an image before publishing.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const post_type =
        images.length && content.trim()
          ? 'text_with_image'
          : images.length
          ? 'image'
          : 'text'

      // Matches the shape used in dummyPostsData
      const formData = new FormData()
      formData.append('content', content.trim())
      formData.append('post_type', post_type)
      images.forEach((img) => formData.append('images', img.file))

      // TODO: replace with your real API call, e.g.
      // await api.post('/api/post/add', formData)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus({ type: 'success', text: 'Post published.' })
      setContent('')
      images.forEach((img) => URL.revokeObjectURL(img.preview))
      setImages([])

      setTimeout(() => navigate('/'), 800)
    } catch (error) {
      setStatus({ type: 'error', text: 'Could not publish your post. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  const canPublish = (content.trim() || images.length > 0) && !loading

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Post</h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        {/* Form card */}
        <div className="max-w-xl bg-white p-4 sm:p-5 rounded-xl shadow-md space-y-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="w-12 h-12 rounded-full object-cover shadow"
            />
            <div>
              <h2 className="font-semibold text-slate-900">{user.full_name}</h2>
              <p className="text-sm text-slate-500">@{user.username}</p>
            </div>
          </div>

          {/* Text area */}
          <textarea
            className="w-full resize-none min-h-20 mt-2 text-sm outline-none placeholder-slate-400"
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={img.preview} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Upload ${i + 1}`}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                    className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Status message */}
          {status && (
            <p
              role="status"
              className={`text-sm ${
                status.type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {status.text}
            </p>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <Image className="size-6" />
              <span className="sr-only">Add images</span>
            </label>
            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={handleImageChange}
            />

            <button
              type="button"
              disabled={!canPublish}
              onClick={handlePublish}
              className="flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
