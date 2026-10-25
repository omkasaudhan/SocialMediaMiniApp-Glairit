import{Routes, Route} from 'react-router-dom'
import Login from './Pages/Login'
import Feed from './Pages/feed'
import Messages from './Pages/messages'
import CreatePost from './Pages/CreatePost'
import ChatBox from './Pages/ChatBox'
import Connections from './Pages/Connections'
import Discover from './Pages/Discover'
import Profile from './Pages/profile'
import {useUser} from '@clerk/react'
import Layout from './Pages/Layout' 

function App() {
  const {user} = useUser() 
  return (
    <>
      <Routes>
        <Route path='/' element={!user ?<Login /> : <Layout />}>
            <Route index element={<Feed />}/>
            <Route path='/messages' element={<Messages />}/>
            <Route path='/create-post' element={<CreatePost />}/>
            <Route path='/messages/:userId' element={<ChatBox />}/>
            <Route path='/connections' element={<Connections />}/>
            <Route path='/discover' element={<Discover />}/>
            <Route path='/profile' element={<Profile />}/>
            <Route path='/profile/:userId' element={<Profile />}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
