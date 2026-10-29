import {useNavigate} from 'react-router-dom'
import {assets,dummyRecentMessagesData,} from '../../assets/assets'
import TimeAgo from './TimeAgo'
const RightSidebar = () => {
  const navigate = useNavigate()

  return (
    <aside className="max-xl:hidden sticky top-6 w-72 shrink-0 space-y-4">
      {/* Sponsored */}
      <div className="bg-white p-3 rounded-md shadow space-y-2">
        <h3 className="text-slate-800 font-semibold text-sm">Sponsored</h3>
        <img src={assets.sponsored_img} alt="Sponsored" className="w-full h-44 object-cover rounded-md" />
        <p className="text-slate-600 text-sm">Email marketing</p>
        <p className="text-slate-400 text-xs">
          Supercharge your marketing with a powerful, easy-to-use platform built for results.
        </p>
      </div>

      {/* Recent messages */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Recent Messages</h3>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
          {dummyRecentMessagesData.map((message) => (
            <button
              key={message._id}
              type="button"
              onClick={() => navigate(`/messages/${message.from_user_id._id}`)}
              className="flex items-start gap-2 py-2 px-1 rounded hover:bg-slate-100 text-left cursor-pointer"
            >
              <img src={message.from_user_id.profile_picture} alt="" className="size-8 rounded-full object-cover" />
              <div className="w-full min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-xs text-slate-800 truncate">{message.from_user_id.full_name}</p>
                  <p className="text-[10px] text-slate-400 shrink-0">{TimeAgo(message.createdAt)}</p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    {message.text ? message.text : 'Media'}
                  </p>
                  {!message.seen && (
                    <span className="bg-indigo-500 text-white size-4 flex items-center justify-center text-[10px] rounded-full shrink-0">
                      1
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
export default RightSidebar