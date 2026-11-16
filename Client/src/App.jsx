import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Pages/Login'
import Feed from './Pages/Feed'
import Messages from './Pages/Messages'
import CreatePost from './Pages/CreatePost'
import ChatBox from './Pages/ChatBox'
import Connections from './Pages/Connections'
import Discover from './Pages/Discover'
import Profile from './Pages/Profile'
import Notification from './Components/Notification'
import { useUser, useAuth } from '@clerk/react'
import Layout from './Pages/Layout' 
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { fetchUser } from './features/user/userSlice'
import { useDispatch } from 'react-redux'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'

function App() {
  const { user, isLoaded } = useUser() 
  const { getToken } = useAuth()
  const {pathname} = useLocation()
  const pathnameRef = useRef(pathname)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {  
      if (user) {
        try {
          const token = await getToken()
          dispatch(fetchUser(token))
          dispatch(fetchConnections(token))
          
        } catch (error) {
          console.error("Error fetching auth token:", error)
        }
      } 
    }
    fetchData()
  }, [user, getToken, dispatch])

  useEffect(()=>{
    pathnameRef.current = pathname
  },[pathname])

  useEffect(()=>{
    if(user){
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id);
      eventSource.onmessage =(event)=>{
        const message = JSON.parse(event.data)
        if(pathnameRef.current === ('/messages/' + message.from_user_id._id)){
          dispatch(addMessage(message))
        }else{
          toast.custom(
            (t)=><Notification t={t} message={message} />
          ,{position: "bottom-right"})
        }
      }
      return ()=>{
        eventSource.close()
      }
    }
  },[user, dispatch])

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
