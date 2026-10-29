import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import TimeAgo from './TimeAgo'


const STORY_DURATION = 5000 // ms for text / image stories
const StoryViewer = ({ stories, index, setIndex, onClose }) => {
  const story = stories[index]
  const [progress, setProgress] = useState(0)

  const goNext = () => (index < stories.length - 1 ? setIndex(index + 1) : onClose())
  const goPrev = () => (index > 0 ? setIndex(index - 1) : onClose())

  // Auto-advance text and image stories
  useEffect(() => {
    setProgress(0)
    if (story.media_type === 'video') return
    const start = Date.now()
    const id = setInterval(() => {
      const p = ((Date.now() - start) / STORY_DURATION) * 100
      if (p >= 100) {
        clearInterval(id)
        goNext()
      } else {
        setProgress(p)
      }
    }, 50)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Close with Escape, navigate with arrow keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md h-[85vh] rounded-lg overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: story.media_type === 'text' ? story.background_color : '#000' }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/30 z-20">
          <div className="h-full bg-white transition-all duration-100 linear" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <img src={story.user.profile_picture} alt="" className="size-8 rounded-full object-cover border border-white/70" />
            <div className="leading-tight">
              <p className="text-sm font-medium">{story.user.full_name}</p>
              <p className="text-xs text-white/70">{TimeAgo(story.createdAt)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close story" className="cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tap zones */}
        <button type="button" aria-label="Previous story" onClick={goPrev} className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" />
        <button type="button" aria-label="Next story" onClick={goNext} className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" />

        {/* Content */}
        {story.media_type === 'text' && (
          <p className="text-white text-xl text-center px-8 whitespace-pre-line">{story.content}</p>
        )}
        {story.media_type === 'image' && (
          <img src={story.media_url} alt="" className="w-full h-full object-contain" />
        )}
        {story.media_type === 'video' && (
          <video
            key={story._id}
            src={story.media_url}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => {
              const v = e.currentTarget
              if (v.duration) setProgress((v.currentTime / v.duration) * 100)
            }}
            onEnded={goNext}
          />
        )}
      </div>
    </div>
  )
}
export default StoryViewer