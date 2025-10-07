"use client"

import { useState, useEffect } from 'react'
import { X, Eye, Calendar, Lock, User, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GuestLinkFormData {
  name?: string
  guestDisplayName?: string
  expiresInDays: number | null
  password?: string
}

interface GuestLinkFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GuestLinkFormData) => void
  initialData?: GuestLinkFormData
  isEditing?: boolean
}

export default function GuestLinkForm({ isOpen, onClose, onSubmit, initialData, isEditing = false }: GuestLinkFormProps) {
  const [formData, setFormData] = useState<GuestLinkFormData>(initialData || {
    name: '',
    guestDisplayName: '',
    expiresInDays: 7,
    password: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(isEditing || false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setConfirmPassword(initialData.password || '')
      if (initialData.name || initialData.guestDisplayName || initialData.password) {
        setShowAdvanced(true)
      }
    }
  }, [initialData])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSubmit = () => {
    const trimmedPassword = formData.password?.trim()

    const submitData: GuestLinkFormData = {
      name: formData.name?.trim() || undefined,
      guestDisplayName: formData.guestDisplayName?.trim() || undefined,
      expiresInDays: formData.expiresInDays,
      password: trimmedPassword || (isEditing ? '' : undefined)
    }

    onSubmit(submitData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      guestDisplayName: '',
      expiresInDays: 7,
      password: ''
    })
    setConfirmPassword('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {isEditing ? 'Gast-Link bearbeiten' : 'Gast-Link erstellen'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Quick Mode Message */}
          {!showAdvanced && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
              💡 Schnellmodus: Link läuft nach 7 Tagen ab. Für mehr Optionen klicke auf "Erweiterte Einstellungen".
            </div>
          )}

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium text-slate-700"
          >
            <span>Erweiterte Einstellungen</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <>
              {/* Link Name (optional) */}
              <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Eye className="w-4 h-4" />
              <span>Link-Name (optional)</span>
            </label>
            <Input
              type="text"
              placeholder="z.B. 'Team Alpha', 'Kunde XY'"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">Hilft dir, Links zu unterscheiden</p>
          </div>

          {/* Guest Display Name (optional) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4" />
              <span>Gast-Anzeigename (optional)</span>
            </label>
            <Input
              type="text"
              placeholder="z.B. 'Max Mustermann'"
              value={formData.guestDisplayName}
              onChange={(e) => setFormData({ ...formData, guestDisplayName: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Wenn gesetzt, können Gäste ihren Namen nicht ändern
            </p>
          </div>

          {/* Expiration (optional) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Ablaufdatum</span>
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                placeholder="7"
                value={formData.expiresInDays === null ? '' : formData.expiresInDays}
                onChange={(e) => setFormData({
                  ...formData,
                  expiresInDays: e.target.value ? parseInt(e.target.value) : null
                })}
                className="w-24"
              />
              <span className="text-sm text-slate-600">Tage</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFormData({ ...formData, expiresInDays: null })}
                className="text-xs"
              >
                Unbegrenzt
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formData.expiresInDays === null
                ? 'Link läuft nicht ab'
                : `Link wird nach ${formData.expiresInDays} Tagen ungültig`
              }
            </p>
          </div>

          {/* Password (optional) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4" />
              <span>Passwort (optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Passwort für diesen Link"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              {isEditing
                ? 'Passwort wird im Klartext gespeichert • Leerlassen zum Entfernen'
                : 'Wird im Klartext gespeichert • Nur Missbrauchsschutz'
              }
            </p>
          </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end space-x-2">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isEditing ? 'Änderungen speichern' : 'Gast-Link erstellen'}
          </Button>
        </div>
      </div>
    </div>
  )
}
