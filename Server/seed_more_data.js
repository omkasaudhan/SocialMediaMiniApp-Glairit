import 'dotenv/config'
import connectDB from './Config/db.js'
import User from './models/User.js'
import Post from './models/Post.js'
import Story from './models/Story.js'
import Connection from './models/Connection.js'

async function seedMore() {
  await connectDB()
  console.log('Connected to MongoDB Atlas')

  // 1. Identify logged in user
  const currentUsers = await User.find({ _id: { $ne: null } })
  const myUser = currentUsers.find(u => u.email === 'omkasaudhan15@gmail.com') || currentUsers[0]
  const myId = myUser?._id
  console.log('Logged-in User:', myUser?.full_name, '(', myId, ')')

  // 2. 5 More New User Profiles for Discover
  const newDiscoverUsers = [
    {
      _id: 'user_sophia_lin',
      email: 'sophia@glairit.com',
      full_name: 'Sophia Lin',
      username: 'sophia_tech',
      bio: 'Product Manager @ FinTech. Passionate about AI, web3, and building products that scale. 🚀',
      profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1280',
      location: 'Singapore',
      followers: [],
      following: [],
      connections: []
    },
    {
      _id: 'user_marcus_vance',
      email: 'marcus@glairit.com',
      full_name: 'Marcus Vance',
      username: 'marcus_builds',
      bio: 'Systems Architect & Open-source maintainer. Rust, Go & Distributed systems enthusiast ⚡',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1280',
      location: 'Berlin, Germany',
      followers: [],
      following: [],
      connections: []
    },
    {
      _id: 'user_elena_rostova',
      email: 'elena@glairit.com',
      full_name: 'Elena Rostova',
      username: 'elena_creative',
      bio: 'Brand Strategist & Visual Storyteller. Turning complex ideas into beautiful narratives 🎨✨',
      profile_picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1280',
      location: 'Paris, France',
      followers: [],
      following: [],
      connections: []
    },
    {
      _id: 'user_kavita_sharma',
      email: 'kavita@glairit.com',
      full_name: 'Kavita Sharma',
      username: 'kavita_codes',
      bio: 'Full-Stack Cloud Engineer | AWS & Kubernetes certified. Coffee, code, repeat ☕💻',
      profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280',
      location: 'Bengaluru, India',
      followers: [],
      following: [],
      connections: []
    },
    {
      _id: 'user_liam_oconnor',
      email: 'liam@glairit.com',
      full_name: "Liam O'Connor",
      username: 'liam_design',
      bio: 'Motion Designer & 3D Artist. Creating surreal worlds with Blender and After Effects 🌌',
      profile_picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280',
      location: 'Dublin, Ireland',
      followers: [],
      following: [],
      connections: []
    }
  ]

  for (const user of newDiscoverUsers) {
    await User.findByIdAndUpdate(user._id, user, { upsert: true, new: true })
    console.log('Upserted discover user:', user.full_name)
  }

  // Ensure myUser follows Sarah Connor and Richard Hendricks so their feed posts & stories show
  if (myId) {
    await User.findByIdAndUpdate(myId, {
      $addToSet: {
        following: { $each: ['user_john_warren', 'user_alexa_james', 'user_sarah_connor'] },
        connections: 'user_richard_hendricks'
      }
    })
  }

  // 3. More Posts for Feed
  const newFeedPosts = [
    {
      _id: '6afc51010000000000000001',
      user: 'user_richard_hendricks',
      content: 'Just deployed our new compression algorithm to production. 42% latency reduction across all server clusters! Speed and simplicity win every time. 🏎️💨 #engineering #devlife #performance #scale',
      image_urls: [
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: [myId].filter(Boolean),
      createdAt: new Date(Date.now() - 1000 * 60 * 35) // 35 mins ago
    },
    {
      _id: '6afc51010000000000000002',
      user: 'user_alexa_james',
      content: 'Good design is like a refrigerator—when it works, no one notices, but when it doesn’t, it sure stinks. Refining typography & spacing for our mobile app release! 📱🎨 #uiux #designsystems #minimalism',
      image_urls: [
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: ['user_richard_hendricks', myId].filter(Boolean),
      createdAt: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hrs ago
    },
    {
      _id: '6afc51010000000000000003',
      user: 'user_john_warren',
      content: 'Remote work superpower: clear written documentation. When teams prioritize asynchronous communication, meetings become optional and deep focus becomes the norm. ☕🗺️ #startups #remotework #culture',
      image_urls: [
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: [myId].filter(Boolean),
      createdAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hrs ago
    },
    {
      _id: '6afc51010000000000000004',
      user: 'user_sarah_connor',
      content: 'Multi-modal AI agents are transforming how we interact with software. Here is a sneak peek into the autonomous workflow engine we built this week! 🤖⚡ #ai #machinelearning #futuretech',
      image_urls: [
        'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: ['user_alexa_james'],
      createdAt: new Date(Date.now() - 1000 * 60 * 360) // 6 hrs ago
    },
    {
      _id: '6afc51010000000000000005',
      user: 'user_sophia_lin',
      content: 'Product tip: Talk to at least 5 customers every week. Data tells you WHAT is happening; customer conversations tell you WHY. 💡📊 #productmanagement #growth #strategy',
      image_urls: [
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 720) // 12 hrs ago
    },
    {
      _id: '6afc51010000000000000006',
      user: 'user_marcus_vance',
      content: 'Clean architecture in microservices: keep services decoupled, embrace idempotency, and never underestimate logging and tracing. 🛠️ #backend #cloud #devops',
      image_urls: [
        'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 1440) // 1 day ago
    }
  ]

  for (const post of newFeedPosts) {
    await Post.findByIdAndUpdate(post._id, post, { upsert: true, new: true })
    console.log('Upserted feed post by:', post.user)
  }

  // 4. More Stories
  const newStories = [
    {
      _id: '6afc52020000000000000001',
      user: 'user_richard_hendricks',
      content: 'Debugging algorithms at 2 AM with endless coffee ☕💻',
      media_urls: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
      media_type: 'image',
      background_color: '#4f46e5',
      createdAt: new Date()
    },
    {
      _id: '6afc52020000000000000002',
      user: 'user_alexa_james',
      content: 'Morning architectural walk in London 🏛️ Autumn light is magical.',
      media_urls: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
      media_type: 'image',
      background_color: '#7c3aed',
      createdAt: new Date()
    },
    {
      _id: '6afc52020000000000000003',
      user: 'user_john_warren',
      content: 'Big feature drop coming to Glairit this Wednesday! Stay tuned 👀🚀',
      media_urls: '',
      media_type: 'text',
      background_color: '#2563eb',
      createdAt: new Date()
    },
    {
      _id: '6afc52020000000000000004',
      user: 'user_sarah_connor',
      content: 'Summit reached! Recharge and disconnect when you can 🏔️✨',
      media_urls: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
      media_type: 'image',
      background_color: '#059669',
      createdAt: new Date()
    },
    {
      _id: '6afc52020000000000000005',
      user: myId || 'user_3LSF9PuoOQA4DM9YMmHARGFkjDo',
      content: 'Building the next generation social experience with Glairit! 🌟',
      media_urls: '',
      media_type: 'text',
      background_color: '#6366f1',
      createdAt: new Date()
    }
  ]

  for (const story of newStories) {
    await Story.findByIdAndUpdate(story._id, story, { upsert: true, new: true })
    console.log('Upserted story for:', story.user)
  }

  console.log('Seeding completed successfully!')
  process.exit(0)
}

seedMore().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
