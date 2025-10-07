"use client"

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { ref, onValue, push, set, serverTimestamp, off } from 'firebase/database'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import { GuestComment } from '@/types/todo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GuestCommentsProps {
  listId: string
  todoId: string
  guestLinkId: string
  guestName: string
  isGuest: boolean
}

export default function GuestComments({
  listId,
  todoId,
  guestLinkId,
  guestName,
  isGuest
}: GuestCommentsProps) {
  const [comments, setComments] = useState<GuestComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return

    const commentsRef = ref(db, `lists/${listId}/todos/${todoId}/guestComments`)

    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const commentsList = Object.keys(data).map(commentId => ({
          id: commentId,
          ...data[commentId]
        } as GuestComment))
          .sort((a, b) => {
            const aTime = typeof a.createdAt === 'number' ? a.createdAt : 0
            const bTime = typeof b.createdAt === 'number' ? b.createdAt : 0
            return aTime - bTime
          })
        setComments(commentsList)
      } else {
        setComments([])
      }
    })

    return () => off(commentsRef, 'value', unsubscribe)
  }, [listId, todoId])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isFirebaseConfigured() || !db) return

    setIsSubmitting(true)

    try {
      const commentsRef = ref(db, `lists/${listId}/todos/${todoId}/guestComments`)
      const newCommentRef = push(commentsRef)

      await set(newCommentRef, {
        todoId,
        text: newComment.trim(),
        guestName,
        guestLinkId,
        createdAt: serverTimestamp()
      })

      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  if (!isGuest && comments.length === 0) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-purple-100">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-xs text-purple-600 font-medium mb-2 hover:text-purple-700 transition-colors w-full"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Gast-Kommentare ({comments.length})</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 ml-auto" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-auto" />
            )}
          </button>
          {isExpanded && (
            <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-purple-50 rounded-lg p-2 text-sm">
              <p className="text-slate-700">{comment.text}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Eye className="w-3 h-3 text-purple-400" />
                <p className="text-xs text-purple-500">
                  {comment.guestName} • {
                    typeof comment.createdAt === 'number'
                      ? new Date(comment.createdAt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'gerade eben'
                  }
                </p>
              </div>
            </div>
          ))}
            </div>
          )}
        </div>
      )}

      {/* Comment Input (only for guests) */}
      {isGuest && (
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Kommentar hinzufügen..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className="flex-1 text-sm h-8 bg-white"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className="h-8 px-3 bg-purple-500 hover:bg-purple-600"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
