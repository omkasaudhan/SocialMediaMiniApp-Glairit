import {useState } from 'react'
import {X, Image as ImageIcon, Type, Sparkle, Upload, TextIcon,} from 'lucide-react'
import {dummyUserData} from '../../assets/assets'
import { useAuth } from '@clerk/react'
import api from '../../api/axios'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
const STORY_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#059669', '#0891b2', '#1e293b']

const StoryModel = ({ onClose, onCreate }) => {
  const [mode, setMode] = useState('text') // 'text' | 'media'
  const [text, setText] = useState('')
  const [color, setColor] = useState(STORY_COLORS[0])
  const [media, setMedia] = useState(null) // { url, type }
  const [previewUrl, setPreviewUrl] = useState('')
  
  const { getToken } = useAuth()
  const currentUser = useSelector((state)=>state.user.value)
   

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE_MB = 50;
  
  const handleMedia = (e) => {
    const file = e.target.files?.[0]
    if(file){
      if(file.type.startsWith("video")){
        if(file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024){
          toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB}`)
          setMedia(null)
          setPreviewUrl('')
          return;
        }

        const video = document.createElement('video');
        video.preload = 'metadata'
        video.onloadedmetadata = ()=>{
            window.URL.revokeObjectURL(video.src)
            if(video.duration > MAX_VIDEO_DURATION){
                toast.error("Video duration cannot exceed 1 minute.")
                setMedia(null)
                setPreviewUrl('')
            }else{
                setMedia(file)
                setPreviewUrl(URL.createObjectURL(file))
                setText('')
                setMode("media")
            }
         }
        video.src = URL.createObjectURL(file)
      }else if(file.type.startsWith("image")){
          setMedia(file)
          setPreviewUrl(URL.createObjectURL(file))
          setText('')
          setMode("media")
      }
    }
    
  }

  const canCreate = mode === 'text' ? text.trim() : media

  const handleCreate = async () => {
    if(!canCreate) return

    const media_type = mode === 'media' ? media?.type.startsWith('image') ? 'image' : "video" : "text"
    if(media_type === "text" && !text){
      throw new Error("Please enter some text")
    }

    let formData = new FormData()
    formData.append('content', text)
    formData.append('media_type', media_type)
    formData.append('media', media)
    formData.append('background_color', color)
    
    const token = await getToken()
    try {
      const { data } = await api.post('/api/story/create', formData, {headers: {Authorization: `Bearer ${token}`}
      })
      if (data.success){
        toast.success("Story created Succesfully")
        if(onCreate) onCreate(data.story || data.data)
        onClose()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message)
    }
    
    if (!canCreate) return
    // const now = new Date().toISOString()
    // onCreate({
    //   _id: `local_${Date.now()}`,
    //   user: currentUser,
    //   content: mode === 'text' ? text.trim() : '',
    //   media_url: mode === 'media' ? media.url : '',
    //   media_type: mode === 'media' ? media.type : 'text',
    //   background_color: color,
    //   createdAt: now,
    //   updatedAt: now,
    // })
    // // TODO: send to your API, e.g. await api.post('/api/story/create', formData)
    // onClose()
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
            {media && previewUrl ? (
              media.type.startsWith ('video') ? (
                <video src={previewUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img src={previewUrl} alt="Story preview" className="w-full h-full object-cover" />
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
              <TextIcon size={18} /> Text
            </button>
            <label htmlFor="story-media"
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md cursor-pointer ${
                mode === 'media' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Upload size={18} /> Photo / video
            </label>

          </div>

          <button
            type="button"
            onClick={()=> toast.promise(handleCreate(), {loading: 'Saving... ', error: (err)=> toast.error(err.message)})}
            disabled={!canCreate}
            className="flex item-center gap-1.5 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-5 py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
           < Sparkle size={18} /> Create Story
          </button>
        </div>
      </div>
    </div>
  )
}
export default StoryModel