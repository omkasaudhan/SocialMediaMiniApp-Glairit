import {useState } from 'react'
import {X, Image as ImageIcon, Type,} from 'lucide-react'
import {dummyUserData} from '../../assets/assets'

const STORY_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#059669', '#0891b2', '#1e293b']

const StoryModel = ({ onClose, onCreate }) => {
  const [mode, setMode] = useState('text') // 'text' | 'media'
  const [text, setText] = useState('')
  const [color, setColor] = useState(STORY_COLORS[0])
  const [media, setMedia] = useState(null) // { url, type }

  const handleMedia = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (media) URL.revokeObjectURL(media.url)
    setMedia({ url: URL.createObjectURL(file), type: file.type.startsWith('video') ? 'video' : 'image' })
    e.target.value = ''
  }

  const canCreate = mode === 'text' ? text.trim() : media

  const handleCreate = () => {
    if (!canCreate) return
    const now = new Date().toISOString()
    onCreate({
      _id: `local_${Date.now()}`,
      user: dummyUserData,
      content: mode === 'text' ? text.trim() : '',
      media_url: mode === 'media' ? media.url : '',
      media_type: mode === 'media' ? media.type : 'text',
      background_color: color,
      createdAt: now,
      updatedAt: now,
    })
    // TODO: send to your API, e.g. await api.post('/api/story/create', formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Create story</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'text' ? (
          <textarea
            className="w-full h-56 p-4 rounded-lg text-white placeholder-white/60 resize-none outline-none"
            style={{ backgroundColor: color }}
            placeholder="What's on your mind?"
            maxLength={250}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <label
            htmlFor="story-media"
            className="h-56 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 flex items-center justify-center overflow-hidden cursor-pointer text-sm text-indigo-600"
          >
            {media ? (
              media.type === 'video' ? (
                <video src={media.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={media.url} alt="Story preview" className="w-full h-full object-cover" />
              )
            ) : (
              'Choose a photo or video'
            )}
          </label>
        )}
        <input type="file" id="story-media" accept="image/*,video/*" hidden onChange={handleMedia} />

        {mode === 'text' && (
          <div className="flex gap-2">
            {STORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Background ${c}`}
                onClick={() => setColor(c)}
                className={`size-6 rounded-full cursor-pointer ${color === c ? 'ring-2 ring-offset-2 ring-slate-500' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md cursor-pointer ${mode === 'text' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button
              type="button"
              onClick={() => setMode('media')}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md cursor-pointer ${mode === 'media' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}
            >
              <ImageIcon className="w-4 h-4" /> Photo / video
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-5 py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Share story
          </button>
        </div>
      </div>
    </div>
  )
}
export default StoryModel