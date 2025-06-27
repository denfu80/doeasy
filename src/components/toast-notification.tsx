"use client"

import { useEffect, useState } from 'react'
import { CheckCircle, RotateCcw, X } from 'lucide-react'

interface ToastNotificationProps {
  message: string
  type: 'success' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  onUndo?: () => void
  undoText?: string
  duration?: number
}

export default function ToastNotification({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  onUndo, 
  undoText = 'Rückgängig',
  duration = 5000 
}: ToastNotificationProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isVisible && !onUndo) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onUndo])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleUndo = () => {
    if (onUndo) {
      onUndo()
      handleClose()
    }
  }

  if (!isVisible) return null

  const colorClasses = {
    success: 'bg-green-500 border-green-600',
    info: 'bg-blue-500 border-blue-600', 
    warning: 'bg-yellow-500 border-yellow-600'
  }

  const iconClasses = {
    success: 'text-green-100',
    info: 'text-blue-100',
    warning: 'text-yellow-100'
  }

  return (
    <div 
      className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}
    >
      <div className={`${colorClasses[type]} border rounded-lg shadow-lg px-4 py-3 max-w-sm`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle className={`w-5 h-5 ${iconClasses[type]} flex-shrink-0`} />
            <p className="text-white text-sm font-medium">{message}</p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {onUndo && (
              <button
                onClick={handleUndo}
                className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-white text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {undoText}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            >
              <X className={`w-4 h-4 ${iconClasses[type]}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}