import {useState,useMemo} from 'react'
import {dummyPostsData} from '../assets/assets'
import StoriesBar from '../Components/feeds/StoriesBar'
import PostCard from '../Components/feeds/PostCard'
import RightSidebar from '../Components/feeds/RightSidebar'
import TimeAgo from '../Components/feeds/TimeAgo'



const Feed = () => {
  
  const posts = useMemo(
      () => [...dummyPostsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      []
    )
  return (
    <div className='h-screen overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* {stories and post list} */}
      <div className='flex-1 max-w-2xl w-full'>
        <StoriesBar />
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} postedAt={TimeAgo(post.createdAt)}/>
          ))}
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