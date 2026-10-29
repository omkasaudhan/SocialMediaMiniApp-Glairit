import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'

const inputClass =
  'w-full p-3 border border-gray-200 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

const EditProfile = ({ user, onClose, onSave }) => {
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

  // Close with Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && handleCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileImage, coverImage])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.full_name.trim()) return setError('Name is required.')
    if (!form.username.trim()) return setError('Username is required.')
    if (/\s/.test(form.username.trim())) return setError('Username cannot contain spaces.')

    setSaving(true)
    try {
      // TODO: replace with your API call, e.g.
      // const fd = new FormData()
      // Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      // profileImage && fd.append('profile', profileImage.file)
      // coverImage && fd.append('cover', coverImage.file)
      // const { data } = await api.post('/api/user/update', fd)
      await new Promise((resolve) => setTimeout(resolve, 600))

      onSave({
        ...user,
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        profile_picture: profileImage ? profileImage.preview : user.profile_picture,
        cover_photo: coverImage ? coverImage.preview : user.cover_photo,
      })
      onClose() // previews stay alive because the profile now uses them
    } catch {
      setError('Could not save your changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div className="max-w-2xl mx-auto sm:py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>

          {/* Profile picture */}
          <div className="space-y-2">
            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <input type="file" id="profile_picture" accept="image/*" hidden onChange={pickImage(profileImage, setProfileImage)} />
            <label htmlFor="profile_picture" className="group/profile relative inline-block cursor-pointer">
              <img
                src={profileImage ? profileImage.preview : user.profile_picture}
                alt="Profile"
                className="size-24 rounded-full object-cover"
              />
              <div className="absolute inset-0 hidden group-hover/profile:flex items-center justify-center bg-black/25 rounded-full">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>

          {/* Cover photo */}
          <div className="space-y-2">
            <label htmlFor="cover_photo" className="block text-sm font-medium text-gray-700">
              Cover Photo
            </label>
            <input type="file" id="cover_photo" accept="image/*" hidden onChange={pickImage(coverImage, setCoverImage)} />
            <label htmlFor="cover_photo" className="group/cover relative block w-80 max-w-full cursor-pointer">
              {coverImage || user.cover_photo ? (
                <img
                  src={coverImage ? coverImage.preview : user.cover_photo}
                  alt="Cover"
                  className="w-80 max-w-full h-40 rounded-lg object-cover"
                />
              ) : (
                <div className="w-80 max-w-full h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />
              )}
              <div className="absolute inset-0 hidden group-hover/cover:flex items-center justify-center bg-black/25 rounded-lg">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>

          {/* Text fields */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input id="full_name" name="full_name" type="text" className={inputClass} placeholder="Please enter your full name" value={form.full_name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input id="username" name="username" type="text" className={inputClass} placeholder="Please enter a username" value={form.username} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea id="bio" name="bio" rows={3} className={`${inputClass} resize-none`} placeholder="Please enter a short bio" value={form.bio} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input id="location" name="location" type="text" className={inputClass} placeholder="Please enter your location" value={form.location} onChange={handleChange} />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
