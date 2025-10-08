"use client"

import { useState, useRef, useEffect } from 'react'
import { ListFlavour } from '@/types/todo'
import { flavourConfigs } from '@/lib/flavour-config'

interface FlavourSelectorProps {
  currentFlavour: ListFlavour
  onFlavourChange: (flavour: ListFlavour) => void
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
}

export default function FlavourSelector({
  currentFlavour,
  onFlavourChange,
  isOpen,
  onClose,
  triggerRef
}: FlavourSelectorProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // Calculate position based on trigger element
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: triggerRect.bottom + 12,
        left: triggerRect.left
      })
    }
  }, [isOpen, triggerRef])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  const handleSelect = (flavour: ListFlavour) => {
    onFlavourChange(flavour)
    onClose()
  }

  const flavours = Object.values(flavourConfigs)

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[100] animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transformOrigin: 'top left'
      }}
    >
      {/* Fan/Arc Layout */}
      <div className="relative flex items-start gap-2">
        {flavours.map((config, index) => {
          const Icon = config.icon
          const isActive = config.id === currentFlavour

          // Stagger animation delay for fan effect
          const delay = index * 50

          return (
            <button
              key={config.id}
              onClick={() => handleSelect(config.id)}
              className="group relative flex flex-col items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300"
              style={{
                animationDelay: `${delay}ms`,
                animationFillMode: 'backwards'
              }}
              title={config.label}
            >
              {/* Icon Circle */}
              <div
                className={`relative w-14 h-14 bg-gradient-to-r ${config.colors.gradient} rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isActive
                    ? 'scale-110 ring-4 ring-white ring-offset-2'
                    : 'hover:scale-110 hover:shadow-xl'
                }`}
              >
                <Icon className="w-7 h-7 text-white" />

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col items-center min-w-0">
                <p className="text-xs font-bold text-slate-800 whitespace-nowrap">
                  {config.label.split('.')[0]}
                  <span className={`text-${config.colors.accent}`}>.</span>
                </p>
                <p className="text-[10px] text-gray-500 capitalize whitespace-nowrap">
                  {config.verb}
                </p>
              </div>

              {/* Hover Glow */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.colors.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
