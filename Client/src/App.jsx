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

function App() {
  const { user } = useUser() 
  const { getToken } = useAuth()

    useEffect(() => {
    const fetchToken = async () => {
      try {
        if (user) {
          const token = await getToken();
          console.log("Clerk Token:", token);
        }
      } catch (error) {
        console.error("Error fetching auth token:", error);
      }
    };

    fetchToken();
  }, [user, getToken]) 
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
