import {useState} from 'react'
import {dummyStoriesData} from '../../assets/assets'
import { Plus } from 'lucide-react'
import StoryModel from './StoryModel'
import StoryViewer from './StoryViewer'
import TimeAgo from './TimeAgo'


const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const StoriesBar = () => {
  const [stories, setStories] = useState(dummyStoriesData)
  const [showCreate, setShowCreate] = useState(false)
  const [viewIndex, setViewIndex] = useState(null)

  return (
    <>
      <div className={`flex gap-4 pb-5 overflow-x-auto ${hideScrollbar}`}>
        {/* Create story */}
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="shrink-0 w-30 aspect-[3/4] rounded-lg border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition"
        >
          <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-700">Create Story</p>
        </button>

        {/* Story cards */}
        {stories.map((story, i) => (
          <button
            key={story._id}
            type="button"
            onClick={() => setViewIndex(i)}
            className="relative shrink-0 w-30 aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg active:scale-95 transition text-left"
            style={{ backgroundColor: story.background_color }}
          >
            {story.media_type === 'image' && (
              <img src={story.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {story.media_type === 'video' && (
              <video src={story.media_url} muted preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />

            <img
              src={story.user.profile_picture}
              alt=""
              className="absolute top-3 left-3 size-8 rounded-full object-cover ring-2 ring-white/80 z-10"
            />
            {story.media_type === 'text' && (
              <p className="absolute top-14 left-3 right-3 text-white/70 text-sm line-clamp-4 z-10">{story.content}</p>
            )}
            <p className="absolute bottom-2 right-2 text-[11px] text-white/80 z-10">{TimeAgo(story.createdAt)}</p>
          </button>
        ))}
      </div>

      {showCreate && (
        <StoryModel
          onClose={() => setShowCreate(false)}
          onCreate={(story) => setStories((prev) => [story, ...prev])}
        />
      )}

      {viewIndex !== null && (
        <StoryViewer
          stories={stories}
          index={viewIndex}
          setIndex={setViewIndex}
          onClose={() => setViewIndex(null)}
        />
      )}
    </>
  )
}

export default StoriesBar