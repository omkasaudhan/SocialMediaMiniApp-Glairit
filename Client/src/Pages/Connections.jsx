import React, { useState } from 'react'
import { Clock, UserCheck, UserPlus, Users } from 'lucide-react'
import {
  dummyConnectionsData,
  dummyFollowersData,
  dummyFollowingData,
  dummyPendingConnectionsData,
} from '../assets/assets'
import Follower from '../Components/Connections/Followers';
import Following from '../Components/Connections/Following';
import Pending from '../Components/Connections/Pending';
import ConnectionList from '../Components/Connections/ConnectionList';

const Connections = () => {
  const [currentTab, setCurrentTab] = useState('followers')

  // Local state so Unfollow / Accept update the page instantly (replace with API data later)
  const [followers] = useState(dummyFollowersData)
  const [following, setFollowing] = useState(dummyFollowingData)
  const [pending, setPending] = useState(dummyPendingConnectionsData)
  const [connections, setConnections] = useState(dummyConnectionsData)

  const handleUnfollow = (userId) => {
    setFollowing((prev) => prev.filter((u) => u._id !== userId))
    // TODO: await api.post('/api/user/unfollow', { id: userId })
  }

  const handleAccept = (userId) => {
    const accepted = pending.find((u) => u._id === userId)
    if (!accepted) return
    setPending((prev) => prev.filter((u) => u._id !== userId))
    // Avoid duplicates if the user is already in the connections list
    setConnections((prev) => (prev.some((u) => u._id === userId) ? prev : [...prev, accepted]))
    // TODO: await api.post('/api/user/accept', { id: userId })
  }

  const tabs = [
    { key: 'followers', label: 'Followers', Icon: Users, count: followers.length },
    { key: 'following', label: 'Following', Icon: UserCheck, count: following.length },
    { key: 'pending', label: 'Pending', Icon: Clock, count: pending.length },
    { key: 'connections', label: 'Connections', Icon: UserPlus, count: connections.length },
  ]

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
