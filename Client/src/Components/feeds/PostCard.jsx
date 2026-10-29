import {useState} from 'react'
import {BadgeCheck,Heart,MessageCircle,Send,Share2} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {dummyUserData} from '../../assets/assets'
import TimeAgo from './TimeAgo'

const renderContent = (text) =>
  text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="text-indigo-600">
        {part}
      </span>
    ) : (
      part
    )
  )

const PostCard = ({ post }) => {
  const navigate = useNavigate()
  const currentUser = dummyUserData

  const [likes, setLikes] = useState(post.likes_count)
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [shares, setShares] = useState(0)
  const [copied, setCopied] = useState(false)

  const liked = likes.includes(currentUser._id)

  const toggleLike = () => {
    setLikes((prev) =>
      prev.includes(currentUser._id) ? prev.filter((id) => id !== currentUser._id) : [...prev, currentUser._id]
    )
    // TODO: await api.post('/api/post/like', { postId: post._id })
  }

  const addComment = () => {
    if (!commentText.trim()) return
    setComments((prev) => [
      ...prev,
      { id: `c_${Date.now()}`, user: currentUser, text: commentText.trim(), createdAt: new Date().toISOString() },
    ])
    setCommentText('')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)
      setShares((s) => s + 1)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full">
      {/* Author */}
      <button
        type="button"
        onClick={() => navigate(`/profile/${post.user._id}`)}
        className="inline-flex items-center gap-3 cursor-pointer text-left"
      >
        <img src={post.user.profile_picture} alt="" className="size-10 rounded-full object-cover shadow" />
        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-900">{post.user.full_name}</span>
            {post.user.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} · {TimeAgo(post.createdAt)}
          </div>
        </div>
      </button>

      {/* Content */}
      {post.content && (
        <div className="text-slate-800 text-sm whitespace-pre-line">{renderContent(post.content)}</div>
      )}

      {/* Images */}
      {post.image_urls.length > 0 && (
        <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.image_urls.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className={`w-full object-cover rounded-lg ${post.image_urls.length === 1 ? 'max-h-[28rem]' : 'h-48'}`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 text-slate-600 text-sm pt-2 border-t border-gray-300">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label="Like"
          className="flex items-center gap-1 cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition ${liked ? 'text-red-500 fill-red-500' : ''}`} />
          <span>{likes.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          aria-label="Comments"
          className="flex items-center gap-1 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length}</span>
        </button>

        <button type="button" onClick={handleShare} aria-label="Share" className="flex items-center gap-1 cursor-pointer">
          <Share2 className="w-4 h-4" />
          <span>{shares}</span>
        </button>

        {copied && <span className="text-xs text-green-600">Link copied</span>}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <img src={c.user.profile_picture} alt="" className="size-7 rounded-full object-cover" />
              <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm">
                <p className="font-medium text-slate-800">{c.user.full_name}</p>
                <p className="text-slate-700">{c.text}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Write a comment..."
              className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addComment}
              disabled={!commentText.trim()}
              aria-label="Post comment"
              className="p-2 rounded-full bg-indigo-500 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard