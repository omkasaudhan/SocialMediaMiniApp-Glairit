import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice.js'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'

const inputClass =
  'w-full p-3 border border-gray-200 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

const EditProfile = ({ user, onClose, onSave }) => {
  const dispatch = useDispatch()
  const { getToken } = useAuth()
  const currentUser = useSelector((state) => state.user.value)

  const [form, setForm] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    bio: user.bio || '',
    location: user.location || '',
  })

  // Newly picked images: { file, preview } or null
  const [profileImage, setProfileImage] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const pickImage = (current, setter) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (current) URL.revokeObjectURL(current.preview)
    setter({ file, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const handleCancel = () => {
    if (profileImage) URL.revokeObjectURL(profileImage.preview)
    if (coverImage) URL.revokeObjectURL(coverImage.preview)
    onClose()
  }

  // Close with Escape key
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && handleCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileImage, coverImage])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const userData = new FormData()
      userData.append('username', form.username.trim())
      userData.append('bio', form.bio.trim())
      userData.append('location', form.location.trim())
      userData.append('full_name', form.full_name.trim())

      if (profileImage?.file) userData.append('profile', profileImage.file)
      if (coverImage?.file) userData.append('cover', coverImage.file)

      const token = await getToken()
      await dispatch(updateUser({ userData, token })).unwrap()

      toast.success('Profile updated successfully!')

      onSave({
        ...user,
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        profile_picture: profileImage ? profileImage.preview : user.profile_picture,
        cover_photo: coverImage ? coverImage.preview : user.cover_photo,
      })

      onClose()
    } catch (err) {
      console.error('Error updating profile:', err)
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Could not save profile'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop: clicking outside closes modal */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal Dialog Container: clicking scrollbar on outer wrapper will NOT trigger handleCancel */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10 pointer-events-none">
        <div className="max-w-2xl w-full pointer-events-auto">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile picture */}
            <div className="space-y-2">
              <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                id="profile_picture"
                accept="image/*"
                hidden
                onChange={pickImage(profileImage, setProfileImage)}
              />
              <label htmlFor="profile_picture" className="group/profile relative inline-block cursor-pointer">
                <img
                  src={profileImage ? profileImage.preview : (user.profile_picture || '/default-avatar.png')}
                  alt="Profile"
                  className="size-24 rounded-full object-cover border-2 border-gray-200 shadow"
                />
                <div className="absolute inset-0 hidden group-hover/profile:flex items-center justify-center bg-black/35 rounded-full transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </label>
            </div>

            {/* Cover photo */}
            <div className="space-y-2">
              <label htmlFor="cover_photo" className="block text-sm font-medium text-gray-700">
                Cover Photo
              </label>
              <input
                type="file"
                id="cover_photo"
                accept="image/*"
                hidden
                onChange={pickImage(coverImage, setCoverImage)}
              />
              <label htmlFor="cover_photo" className="group/cover relative block w-full max-w-md cursor-pointer">
                {coverImage || user.cover_photo ? (
                  <img
                    src={coverImage ? coverImage.preview : user.cover_photo}
                    alt="Cover"
                    className="w-full h-40 rounded-lg object-cover border border-gray-200 shadow"
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 border border-gray-200" />
                )}
                <div className="absolute inset-0 hidden group-hover/cover:flex items-center justify-center bg-black/35 rounded-lg transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </label>
            </div>

            {/* Text fields */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className={inputClass}
                placeholder="Please enter your full name"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={inputClass}
                placeholder="Please enter a username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Please enter a short bio"
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className={inputClass}
                placeholder="Please enter your location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
