import{Routes, Route} from 'react-router-dom'
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
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { fetchUser } from './features/user/userSlice'
import { useDispatch } from 'react-redux'

function App() {
  const { user } = useUser() 
  const { getToken } = useAuth()

  const dispatch = useDispatch()

    useEffect(() => {
      const fetchData = async () => {  
      if (user) {
          const token = await getToken()
          dispatch(fetchUser(token))
        } 
      }
      fetchData()
      }, [user, getToken, dispatch])

  return (
    <>
      <Toaster />

      <Routes>
        <Route path='/' element={!user ?<Login /> : <Layout />}>
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
