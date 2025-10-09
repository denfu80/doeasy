"use client"

import { useRef, useState } from 'react'
import { ListFlavour } from '@/types/todo'
import { getFlavourConfig } from '@/lib/flavour-config'
import FlavourSelector from './flavour-selector'

interface ListLogoProps {
  flavour: ListFlavour
  onFlavourChange: (flavour: ListFlavour) => void
  size?: 'small' | 'large'
  showLabel?: boolean
}

export default function ListLogo({
  flavour,
  onFlavourChange,
  size = 'large',
  showLabel = true
}: ListLogoProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const logoRef = useRef<HTMLButtonElement>(null)

  const config = getFlavourConfig(flavour)
  const Icon = config.icon

  const iconSize = size === 'small' ? 'w-5 h-5' : 'w-6 h-6'
  const containerSize = size === 'small' ? 'w-8 h-8' : 'w-10 h-10'
  const labelSize = size === 'small' ? 'text-xl' : 'text-3xl'

  const handleMouseEnter = () => {
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    setIsDropdownOpen(false)
  }

  return (
    <>
      <div
        className="flex items-center space-x-3"
        onMouseEnter={handleMouseEnter}
      >
        <button
          ref={logoRef}
          className={`${containerSize} bg-gradient-to-r ${config.colors.gradient} rounded-lg flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:rotate-12 cursor-pointer`}
          title="Listenstil ändern"
        >
          <Icon className={`${iconSize} text-white`} />
        </button>
        {showLabel && (
          <div className="flex flex-col">
            <div
              className="group cursor-pointer"
              title="Listenstil ändern"
            >
              <h1
                className={`${labelSize} font-black text-slate-800 tracking-tight group-hover:text-${config.colors.primary} transition-colors duration-200`}
              >
                {config.label.split('.')[0]}
                <span className={`text-${config.colors.accent}`}>.</span>
                einfach
              </h1>
            </div>
          </div>
        )}
      </div>

      <FlavourSelector
        currentFlavour={flavour}
        onFlavourChange={onFlavourChange}
        isOpen={isDropdownOpen}
        onClose={handleMouseLeave}
        triggerRef={logoRef}
      />
    </>
  )
}
