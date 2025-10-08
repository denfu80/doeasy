import { ListFlavour } from '@/types/todo'
import { ShoppingCart, Gift, Calendar, Package, CheckSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FlavourConfig {
  id: ListFlavour
  label: string
  verb: string
  icon: LucideIcon
  colors: {
    gradient: string
    bgGradient: string
    primary: string
    secondary: string
    accent: string
  }
}

export const flavourConfigs: Record<ListFlavour, FlavourConfig> = {
  mach: {
    id: 'mach',
    label: 'mach.einfach',
    verb: 'machen',
    icon: CheckSquare,
    colors: {
      gradient: 'from-pink-500 to-purple-600',
      bgGradient: 'from-pink-50 via-purple-50 to-blue-50',
      primary: 'pink-500',
      secondary: 'purple-600',
      accent: 'pink-500'
    }
  },
  bring: {
    id: 'bring',
    label: 'bring.einfach',
    verb: 'bringen',
    icon: ShoppingCart,
    colors: {
      gradient: 'from-orange-500 to-yellow-600',
      bgGradient: 'from-orange-50 via-yellow-50 to-amber-50',
      primary: 'orange-500',
      secondary: 'yellow-600',
      accent: 'orange-500'
    }
  },
  schenk: {
    id: 'schenk',
    label: 'schenk.einfach',
    verb: 'schenken',
    icon: Gift,
    colors: {
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 via-pink-50 to-rose-50',
      primary: 'red-500',
      secondary: 'pink-600',
      accent: 'red-500'
    }
  },
  organisier: {
    id: 'organisier',
    label: 'organisier.einfach',
    verb: 'organisieren',
    icon: Calendar,
    colors: {
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 via-cyan-50 to-sky-50',
      primary: 'blue-500',
      secondary: 'cyan-600',
      accent: 'blue-500'
    }
  },
  pack: {
    id: 'pack',
    label: 'pack.einfach',
    verb: 'packen',
    icon: Package,
    colors: {
      gradient: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 via-teal-50 to-emerald-50',
      primary: 'green-500',
      secondary: 'teal-600',
      accent: 'green-500'
    }
  }
}

export function getFlavourConfig(flavour: ListFlavour): FlavourConfig {
  return flavourConfigs[flavour]
}
