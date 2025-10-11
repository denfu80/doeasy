"use client"

import { useRef, useState } from 'react'
import Link from 'next/link'
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
  const logoRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)

  const config = getFlavourConfig(flavour)
  const Icon = config.icon

  const iconSize = size === 'small' ? 'w-5 h-5' : 'w-6 h-6'
  const containerSize = size === 'small' ? 'w-8 h-8' : 'w-10 h-10'
  const labelSize = size === 'small' ? 'text-xl' : 'text-3xl'

  // Check if flavour switcher is enabled
  const isFlavourSwitcherEnabled = process.env.NEXT_PUBLIC_ENABLE_FLAVOUR_SWITCHER === 'true'

  const handleMouseEnter = () => {
    if (isFlavourSwitcherEnabled) {
      setIsDropdownOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setIsDropdownOpen(false)
  }

  // Render logo with Link if switcher is disabled
  if (!isFlavourSwitcherEnabled) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          ref={logoRef as React.RefObject<HTMLAnchorElement>}
          className={`${containerSize} bg-gradient-to-r ${config.colors.gradient} rounded-lg flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:rotate-12`}
          title="Zur Startseite"
        >
          <Icon className={`${iconSize} text-white`} />
        </Link>
        {showLabel && (
          <div className="flex flex-col">
            <Link
              href="/"
              className="group"
              title="Zur Startseite"
            >
              <h1
                className={`${labelSize} font-black text-slate-800 tracking-tight group-hover:text-${config.colors.primary} transition-colors duration-200`}
              >
                {config.label.split('.')[0]}
                <span className={`text-${config.colors.accent}`}>.</span>
                einfach
              </h1>
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Render logo with flavour switcher
  return (
    <>
      <div
        className="flex items-center space-x-3"
        onMouseEnter={handleMouseEnter}
      >
        <button
          ref={logoRef as React.RefObject<HTMLButtonElement>}
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
        triggerRef={logoRef as React.RefObject<HTMLElement>}
      />
    </>
  )
}
