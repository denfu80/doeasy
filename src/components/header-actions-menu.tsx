"use client"

import { MoreVertical, Users, Link as LinkIcon, Pin, PinOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface HeaderActionsMenuProps {
  listId: string
  isPinned: boolean
  onTogglePin: () => void
  onShare: () => void
  userCount: number
  onlineUserCount: number
}

export default function HeaderActionsMenu({
  listId,
  isPinned,
  onTogglePin,
  onShare,
  userCount,
  onlineUserCount
}: HeaderActionsMenuProps) {
  const router = useRouter()

  const handleNavigateToUsers = () => {
    router.push(`/list/${listId}/users`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
          title="Menü"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleNavigateToUsers} className="cursor-pointer">
          <Users className="w-4 h-4 mr-2" />
          <span>Nutzer</span>
          <div className="ml-auto flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {onlineUserCount}/{userCount}
            </Badge>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onShare} className="cursor-pointer">
          <LinkIcon className="w-4 h-4 mr-2" />
          <span>Liste teilen</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onTogglePin} className="cursor-pointer">
          {isPinned ? (
            <>
              <PinOff className="w-4 h-4 mr-2" />
              <span>Entpinnen</span>
            </>
          ) : (
            <>
              <Pin className="w-4 h-4 mr-2" />
              <span>Pinnen</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
