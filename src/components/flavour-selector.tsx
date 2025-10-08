"use client"

import { useState, useRef, useEffect } from 'react'
import { ListFlavour } from '@/types/todo'
import { flavourConfigs, getFlavourConfig } from '@/lib/flavour-config'

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
        top: triggerRect.bottom + 8,
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

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[100] bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Listenstil wählen
        </p>
      </div>
      <div className="py-1">
        {Object.values(flavourConfigs).map((config) => {
          const Icon = config.icon
          const isActive = config.id === currentFlavour

          return (
            <button
              key={config.id}
              onClick={() => handleSelect(config.id)}
              className={`w-full px-3 py-2.5 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-gray-50' : ''
              }`}
            >
              <div
                className={`w-9 h-9 bg-gradient-to-r ${config.colors.gradient} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-800">
                  {config.label.split('.')[0]}
                  <span className={`text-${config.colors.accent}`}>.</span>
                  einfach
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {config.verb}
                </p>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
