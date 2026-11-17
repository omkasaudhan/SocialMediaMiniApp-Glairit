import 'dotenv/config'
import connectDB from './Config/db.js'
import User from './models/User.js'
import Connection from './models/Connection.js'
import Post from './models/Post.js'

async function seed() {
  await connectDB()

  // 1. Remove invalid user with _id: null
  await User.deleteMany({ _id: null })

  // 2. Find current user
  const currentUsers = await User.find({ _id: { $ne: null } })
  console.log('Existing real users:', currentUsers.map(u => ({ id: u._id, name: u.full_name, email: u.email })))

  const myUser = currentUsers.find(u => u.email === 'omkasaudhan15@gmail.com') || currentUsers[0]
  const myId = myUser?._id
  console.log('Current logged in user ID:', myId)

  // 3. Demo users definitions
  const demoUsers = [
    {
      _id: 'user_richard_hendricks',
      email: 'richard@glairit.com',
      full_name: 'Richard Hendricks',
      username: 'richard_hendricks',
      bio: 'Compression algorithm wizard & Pied Piper founder 🚀 Silicon Valley',
      profile_picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280',
      location: 'Palo Alto, CA',
      connections: myId ? [myId] : [],
      followers: [],
      following: []
    },
    {
      _id: 'user_alexa_james',
      email: 'alexa@glairit.com',
      full_name: 'Alexa James',
      username: 'alexa_james',
      bio: 'UI/UX Designer & Creative Director ✨ Designing intuitive interfaces.',
      profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
      cover_photo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1280',
      location: 'London, UK',
      connections: [],
      followers: [],
      following: myId ? [myId] : []
    },
    {
      _id: 'user_john_warren',
      email: 'john@glairit.com',
      full_name: 'John Warren',
      username: 'john_warren',
      bio: '🌍 Dreamer | 📚 Learner | 🚀 Doer. Exploring life one step at a time.',
      profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1280',
      location: 'New York, NY',
      connections: [],
      followers: myId ? [myId] : [],
      following: []
    },
    {
      _id: 'user_sarah_connor',
      email: 'sarah@glairit.com',
      full_name: 'Sarah Connor',
      username: 'sarah_connor',
      bio: 'Tech enthusiast & AI researcher. Coffee lover ☕',
      profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1280',
      location: 'San Francisco, CA',
      connections: [],
      followers: [],
      following: []
    },
    {
      _id: 'user_david_miller',
      email: 'david@glairit.com',
      full_name: 'David Miller',
      username: 'david_miller',
      bio: 'Full Stack Developer | Building modern web apps with MERN & Next.js',
      profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
      cover_photo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280',
      location: 'Austin, TX',
      connections: [],
      followers: [],
      following: []
    }
  ]

  for (const demo of demoUsers) {
    await User.findByIdAndUpdate(demo._id, demo, { upsert: true, new: true })
    console.log('Upserted demo user:', demo.full_name)
  }

  // 4. Update myUser connections, followers, following
  if (myId) {
    await User.findByIdAndUpdate(myId, {
      $addToSet: {
        connections: 'user_richard_hendricks',
        followers: 'user_alexa_james',
        following: 'user_john_warren'
      }
    })
    console.log('Updated myUser relationships (1 connection, 1 follower, 1 following)')

    // 5. Create pending connection request from Sarah Connor to myId
    await Connection.findOneAndUpdate(
      { from_user_id: 'user_sarah_connor', to_user_id: myId },
      { from_user_id: 'user_sarah_connor', to_user_id: myId, status: 'pending' },
      { upsert: true, new: true }
    )
    console.log('Created pending connection request from Sarah Connor to myUser')
  }

  // 6. Demo posts for Richard and Alexa
  const demoPosts = [
    {
      _id: '68773e977db16954a783839c',
      user: 'user_richard_hendricks',
      content: "We're a small #team with a big vision — working day and night to turn dreams into products, and #products into something people love. 💻🚀",
      image_urls: [
        'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: [myId].filter(Boolean)
    },
    {
      _id: '686e6d0407845749500c24cd',
      user: 'user_alexa_james',
      content: 'Unlock your potential—every small step counts. Stay consistent, stay focused, and trust the process. 🌱✨ #design #minimalism #inspiration',
      image_urls: [
        'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'
      ],
      post_type: 'text_with_image',
      likes_count: []
    }
  ]

  for (const p of demoPosts) {
    await Post.findByIdAndUpdate(p._id, p, { upsert: true, new: true })
    console.log('Upserted demo post for:', p.user)
  }

  console.log('Seeding completed successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
