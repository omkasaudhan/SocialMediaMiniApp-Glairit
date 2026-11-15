import { Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import Feed from './Pages/Feed'
import Messages from './Pages/Messages'
import CreatePost from './Pages/CreatePost'
import ChatBox from './Pages/ChatBox'
import Connections from './Pages/Connections'
import Discover from './Pages/Discover'
import Profile from './Pages/Profile'
import { useUser, useAuth } from '@clerk/react'
import Layout from './Pages/Layout' 
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { fetchUser } from './features/user/userSlice'
import { useDispatch } from 'react-redux'

function App() {
  const { user, isLoaded } = useUser() 
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {  
      if (user) {
        try {
          const token = await getToken()
          if (token) {
            dispatch(fetchUser(token))
          }
        } catch (error) {
          console.error("Error fetching auth token:", error)
        }
      } 
    }
    fetchData()
  }, [user, getToken, dispatch])

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <>
      <Toaster />

      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />}/>
          <Route path='messages' element={<Messages />}/>
          <Route path='create-post' element={<CreatePost />}/>
          <Route path='messages/:userId' element={<ChatBox />}/>
          <Route path='connections' element={<Connections />}/>
          <Route path='discover' element={<Discover />}/>
          <Route path='profile' element={<Profile />}/>
          <Route path='profile/:userId' element={<Profile />}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
