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

  // Arc animation: items fan out in a counter-clockwise arc
  const getArcPosition = (index: number, total: number) => {
    const radius = 200 // Distance from origin (increased for more spread)
    const startAngle = 160 // Start angle in degrees (straight down from logo)
    const arcSpread = 100 // Total arc spread in degrees (increased spread)
    const angleStep = arcSpread / (total + 1)
    const angle = startAngle - (index * angleStep) // Subtract for counter-clockwise
    const rad = (angle * Math.PI) / 180

    return {
      x: Math.cos(rad) * radius +140,
      y: index*60 + 40,//Math.sin(rad) * radius + 40,
      angle: angle
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[100]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {/* Arc Layout */}
      <div className="relative" style={{ width: '400px', height: '250px' }}>
        {flavours.map((config, index) => {
          const Icon = config.icon
          const isActive = config.id === currentFlavour
          const pos = getArcPosition(index, flavours.length)
          const delay = index * 60

          return (
            <button
              key={config.id}
              onClick={() => handleSelect(config.id)}
              className="group absolute flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full pr-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-90"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                animationDelay: `${delay}ms`,
                animationFillMode: 'backwards'
              }}
              title={config.label}
            >
              {/* Icon Circle */}
              <div
                className={`relative w-12 h-12 bg-gradient-to-r ${config.colors.gradient} rounded-full flex items-center justify-center shadow-md transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'ring-2 ring-offset-2 ring-white'
                    : ''
                }`}
              >
                <Icon className="w-6 h-6 text-white" />

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col min-w-0 pr-1">
                <p className="text-sm font-bold text-slate-800 whitespace-nowrap leading-tight">
                  {config.label.split('.')[0]}
                  <span className={`text-${config.colors.accent}`}>.</span>einfach
                </p>
                <p className="text-xs text-gray-500 capitalize whitespace-nowrap leading-tight">
                  {config.verb}
                </p>
              </div>

              {/* Hover Glow */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.colors.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 pointer-events-none`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
