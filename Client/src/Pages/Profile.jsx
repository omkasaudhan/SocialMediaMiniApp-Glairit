import { useEffect, useMemo, useState, useCallback } from 'react'
import { BadgeCheck, Calendar, MapPin, MessageCircle, SquarePen, UserPlus, UserCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import EditProfile from '../Components/EditProfile'
import TimeAgo from '../Components/feeds/TimeAgo'
import PostCard from '../Components/feeds/PostCard'
import Loading from '../Components/loading'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

const TABS = ['posts', 'media', 'likes']

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { getToken } = useAuth()
  const { profileId, userId } = useParams() // supports /profile, /profile/:userId, and /profile/:profileId
  const currentUser = useSelector((state) => state.user.value)

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)

  const targetId = userId || profileId || currentUser?._id

  const fetchProfileData = useCallback(async (idToFetch) => {
    if (!idToFetch) return
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await api.post(
        '/api/user/profiles',
        { profileId: idToFetch, userId: idToFetch },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )

      if (data && data.success) {
        setUser(data.profile)
        setPosts(data.posts || [])
      } else {
        toast.error(data?.message || 'Failed to load profile')
      }
    } catch (error) {
      console.error('fetchProfileData error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (targetId) {
      setUser(null)
      fetchProfileData(targetId)
    }
  }, [targetId, fetchProfileData])

  const isOwnProfile = Boolean(
    currentUser?._id && (targetId === currentUser._id || user?._id === currentUser._id)
  )

  const isFollowing = Boolean(
    currentUser?.following && (
      currentUser.following.includes(user?._id) ||
      currentUser.following.some?.((f) => (typeof f === 'string' ? f === user?._id : f?._id === user?._id))
    )
  )

  const handleFollowToggle = async () => {
    if (!user?._id) return
    try {
      const endpoint = isFollowing ? '/api/user/unfollow' : '/api/user/follow'
      const { data } = await api.post(
        endpoint,
        { id: user._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchUser(await getToken()))
        fetchProfileData(user._id)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [posts])

  const mediaItems = useMemo(() => {
    return sortedPosts.flatMap((p) =>
      (p.image_urls || []).map((url) => ({ url, postId: p._id }))
    )
  }, [sortedPosts])

  const likedPosts = useMemo(() => {
    if (!user) return []
    return sortedPosts.filter(
      (p) => Array.isArray(p.likes_count) && p.likes_count.includes(user._id)
    )
  }, [sortedPosts, user])

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        User not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Cover */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img src={user.cover_photo} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Info */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <img
                src={user.profile_picture || '/default-avatar.png'}
                alt={user.full_name || 'User'}
                className="size-32 rounded-full object-cover border-4 border-white shadow-lg -mt-16 shrink-0 bg-white"
              />

              <div className="w-full md:pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-slate-900">{user.full_name || 'User'}</h1>
                      {user.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {user.username ? `@${user.username}` : 'Add a username'}
                    </p>
                  </div>

                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => setShowEdit(true)}
                      className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium text-slate-800 cursor-pointer"
                    >
                      <SquarePen className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95 cursor-pointer ${
                          isFollowing
                            ? 'border-gray-300 text-slate-700 hover:bg-gray-50'
                            : 'border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {isFollowing ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4 text-indigo-600" />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/messages/${user._id}`)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-slate-700 max-w-md mt-4 whitespace-pre-line">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.location || 'Add location'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined <span className="font-medium">{TimeAgo(user.createdAt)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-lg font-bold text-slate-900">{sortedPosts.length}</span>
                    <span className="text-xs text-gray-500 ml-1.5">Posts</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">{user.followers?.length || 0}</span>
                    <span className="text-xs text-gray-500 ml-1.5">Followers</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">{user.following?.length || 0}</span>
                    <span className="text-xs text-gray-500 ml-1.5">Following</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex justify-center">
          <div role="tablist" className="bg-white rounded-xl shadow p-1 flex w-full max-w-md">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg capitalize transition cursor-pointer ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6 flex flex-col items-center gap-6">
          {activeTab === 'posts' &&
            (sortedPosts.length ? (
              sortedPosts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm w-full">
                <p className="text-slate-500 text-sm">No posts yet.</p>
              </div>
            ))}

          {activeTab === 'media' &&
            (mediaItems.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {mediaItems.map((item, i) => (
                  <a
                    key={`${item.postId}-${i}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group aspect-square rounded-lg overflow-hidden shadow bg-white"
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm w-full">
                <p className="text-slate-500 text-sm">No media yet.</p>
              </div>
            ))}

          {activeTab === 'likes' &&
            (likedPosts.length ? (
              likedPosts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm w-full">
                <p className="text-slate-500 text-sm">No liked posts yet.</p>
              </div>
            ))}
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <EditProfile
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(updatedUser) => {
            setUser((prev) => ({ ...prev, ...updatedUser }))
            setShowEdit(false)
          }}
        />
      )}
    </div>
  )
}

export default Profile
