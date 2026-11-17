import React, { useEffect, useState } from 'react'
import { Clock, UserCheck, UserPlus, UserRoundPen, Users } from 'lucide-react'
// import {dummyConnectionsData,dummyFollowersData,
//   dummyFollowingData,dummyPendingConnectionsData,} from '../assets/assets'
import Follower from '../Components/Connections/Followers';
import Following from '../Components/Connections/Following';
import Pending from '../Components/Connections/Pending';
import ConnectionList from '../Components/Connections/ConnectionList';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { fetchConnections } from '../features/connections/connectionsSlice';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Connections = () => {
  const [currentTab, setCurrentTab] = useState('followers')
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  // Local state so Unfollow / Accept update the page instantly (replace with API data later)
  // const [followers] = useState(dummyFollowersData)
  // const [following, setFollowing] = useState(dummyFollowingData)
  // const [pending, setPending] = useState(dummyPendingConnectionsData)
  // const [connections, setConnections] = useState(dummyConnectionsData)

  const {connections = [], pending = [], followers = [], following = []} = useSelector((state)=>state.connections || state.connection || {})

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      }else{
        toast(data.message)
      } 
    } catch(error){
      toast.error(error.message)
    }}

  const handleAccept = async (userId) => {
    try {
      const { data } = await api.post('/api/user/accept', { id: userId }, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      }else{
        toast(data.message)
      } 
    } catch(error){
      toast.error(error.message)
    }}

  const tabs = [
    { key: 'followers', label: 'Followers', Icon: Users, count: (followers || []).length },
    { key: 'following', label: 'Following', Icon: UserCheck, count: (following || []).length },
    { key: 'pending', label: 'Pending', Icon: UserRoundPen, count: (pending || []).length },
    { key: 'connections', label: 'Connections', Icon: UserPlus, count: (connections || []).length },
  ]
   useEffect(()=>{
    getToken().then((token)=>{
      dispatch(fetchConnections(token))
    })
   },[])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
          <p className="text-slate-600">Manage your network and discover new connections</p>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCurrentTab(tab.key)}
              className="h-20 sm:w-40 flex flex-col items-center justify-center border border-gray-200 bg-white shadow rounded-md cursor-pointer hover:bg-slate-50 transition"
            >
              <b className="text-slate-900">{tab.count}</b>
              <p className="text-slate-600 text-sm">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div role="tablist" className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={currentTab === tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex items-center px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                currentTab === tab.key
                  ? 'bg-slate-100 font-medium text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              <span className="ml-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active list */}
        {currentTab === 'followers' && <Follower users={followers} />}
        {currentTab === 'following' && <Following users={following} onUnfollow={handleUnfollow} />}
        {currentTab === 'pending' && <Pending users={pending} onAccept={handleAccept} />}
        {currentTab === 'connections' && <ConnectionList users={connections} />}
      </div>
    </div>
  )
}

export default Connections
