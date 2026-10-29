import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Calendar, MapPin, MessageCircle,SquarePen } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyConnectionsData, dummyPostsData, dummyUserData } from '../assets/assets'
import EditProfile from '../Components/EditProfile'
import TimeAgo from '../Components/feeds/TimeAgo'
import PostCard from '../Components/feeds/PostCard'


/* ------------------------------------------------------------------ */
/* Profile page                                                        */
/* ------------------------------------------------------------------ */

const Profile = () => {
  const navigate = useNavigate()
  const { profileId } = useParams() // /profile  or  /profile/:profileId
  const currentUser = dummyUserData
  const TABS = ['posts', 'media', 'likes']
  const baseUser = profileId
    ? dummyConnectionsData.find((u) => u._id === profileId)
    : currentUser

  const [user, setUser] = useState(baseUser)
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)

  // Re-sync when navigating between profiles
  useEffect(() => {
    setUser(baseUser)
    setActiveTab('posts')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const isOwnProfile = user && user._id === currentUser._id

  // This user's posts, newest first (uses the edited user details after saving)
  const posts = useMemo(() => {
    if (!user) return []
    return dummyPostsData
      .filter((p) => p.user._id === user._id)
      .map((p) => ({ ...p, user }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [user])

  const likedPosts = useMemo(
    () => dummyPostsData.filter((p) => user && p.likes_count.includes(user._id)),
    [user]
  )

  const mediaItems = useMemo(
    () => posts.flatMap((p) => p.image_urls.map((url) => ({ url, postId: p._id }))),
    [posts]
  )

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
            {user.cover_photo && <img src={user.cover_photo} alt="Cover" className="w-full h-full object-cover" />}
          </div>

          {/* Info */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="size-32 rounded-full object-cover border-4 border-white shadow-lg -mt-16 shrink-0"
              />

              <div className="w-full md:pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
                      {user.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-gray-600 text-sm">{user.username ? `@${user.username}` : 'Add a username'}</p>
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
                    <button
                      type="button"
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </div>

                {user.bio && <p className="text-sm text-slate-700 max-w-md mt-4 whitespace-pre-line">{user.bio}</p>}

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
                    <span className="text-lg font-bold text-slate-900">{posts.length}</span>
                    <span className="text-xs text-gray-500 ml-1.5">Posts</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">{user.followers.length}</span>
                    <span className="text-xs text-gray-500 ml-1.5">Followers</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">{user.following.length}</span>
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
            (posts.length ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-slate-500 text-sm mt-6">No posts yet.</p>
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
                    <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm mt-6">No media yet.</p>
            ))}

          {activeTab === 'likes' &&
            (likedPosts.length ? (
              likedPosts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-slate-500 text-sm mt-6">No liked posts yet.</p>
            ))}
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <EditProfile
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  )
}

export default Profile
