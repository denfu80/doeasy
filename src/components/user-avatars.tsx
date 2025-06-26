import { User } from '@/types/todo'

interface UserAvatarsProps {
  users: User[]
}

export default function UserAvatars({ users }: UserAvatarsProps) {
  return (
    <div className="flex items-center -space-x-3">
      {users.slice(0, 5).map(user => (
        <div 
          key={user.id} 
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md"
          style={{ backgroundColor: user.color, zIndex: user.zIndex }}
          title={user.name || user.id}
        >
          <span className="text-sm font-bold text-white">
            {(user.name || user.id).substring(0, 2).toUpperCase()}
          </span>
        </div>
      ))}
      {users.length > 5 && (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-300 border-2 border-white shadow-md" 
          title={`${users.length - 5} more users`}
        >
          <span className="text-sm font-bold text-slate-700">+{users.length - 5}</span>
        </div>
      )}
    </div>
  )
}