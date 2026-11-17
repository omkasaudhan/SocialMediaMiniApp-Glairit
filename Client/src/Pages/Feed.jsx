import {useMemo} from 'react'
import {dummyPostsData} from '../assets/assets'
import StoriesBar from '../Components/feeds/StoriesBar'
import PostCard from '../Components/feeds/PostCard'
import RightSidebar from '../Components/feeds/RightSidebar'
import TimeAgo from '../Components/feeds/TimeAgo'
import { useAuth } from '@clerk/react' 
import { useEffect } from 'react'
import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'


const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const {data} = await api.get('/api/post/feed', {headers: {Authorization: `Bearer ${token}`}})
      if (data.success){
        setFeeds(data.posts)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }   
  }

  useEffect(()=>{
    fetchFeeds()
  },[])
  const activePosts = useMemo(() => {
    const baselinePosts = feeds.length > 0 ? feeds : dummyPostsData
    return [...baselinePosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [feeds])
  return (
    <div className='h-screen overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* {stories and post list} */}
      <div className='flex-1 max-w-2xl w-full'>
        <StoriesBar />
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Loading your feed...</p>
            </div>
          ) : activePosts.length > 0 ? (
            activePosts.map((post) => (
              <PostCard key={post._id} post={post} postedAt={TimeAgo(post.createdAt)}/>
            ))
          ) : (
            <div className="text-center py-25 text-slate-500 text-sm">
              No posts found. Start following friends to populate your feed!
            </div>
          )}
        </div>
      </div>
      {/* {Right sidebar} */}
      <div className='hidden xl:flex flex-col gap-4 w-80'>
        <RightSidebar />
      </div>

    </div>
  )
}

export default Feed