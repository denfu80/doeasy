"use client"

import { useState, useEffect } from 'react'
import { X, Lock, Unlock } from 'lucide-react'

interface PasswordPromptProps {
  isOpen: boolean
  mode: 'set' | 'verify' | 'remove'
  onConfirm: (password: string) => void
  onCancel: () => void
  error?: string
}

export default function PasswordPrompt({
  isOpen,
  mode,
  onConfirm,
  onCancel,
  error
}: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setConfirmPassword('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'set') {
      if (password !== confirmPassword) {
        return
      }
    }

    if (password.trim()) {
      onConfirm(password)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const isValid = mode === 'set'
    ? password.length >= 1 && password === confirmPassword
    : password.length >= 1

  const needsConfirmation = mode === 'set'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {mode === 'set' ? (
              <Lock className="w-6 h-6 text-purple-600" />
            ) : (
              <Unlock className="w-6 h-6 text-purple-600" />
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {mode === 'set' ? 'Passwort festlegen' : mode === 'remove' ? 'Passwortschutz entfernen' : 'Passwort eingeben'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {mode === 'set' ? 'Neues Passwort' : mode === 'remove' ? 'Aktuelles Passwort' : 'Passwort'}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Passwort..."
              autoFocus
            />
          </div>

          {needsConfirmation && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Passwort bestätigen
              </label>
              <input
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Passwort wiederholen..."
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'set' ? 'Schließen' : mode === 'remove' ? 'Passwort entfernen' : 'Zugang gewähren'}
            </button>
          </div>
        </form>

        {mode === 'set' && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 text-center">
              Nur Missbrauchsschutz • Passwort wird im Klartext gespeichert
            </p>
            <p className="text-xs text-amber-600 text-center font-medium">
              ⚠️ Nicht für sensible Daten geeignet
            </p>
          </div>
        )}
        {mode === 'remove' && (
          <p className="text-xs text-slate-500 mt-4 text-center">
            Nach dem Entfernen kann jeder auf die Liste zugreifen
          </p>
        )}
        {mode === 'verify' && (
          <p className="text-xs text-slate-500 mt-4 text-center">
            Nur Missbrauchsschutz • Passwort ist sichtbar
          </p>
        )}
      </div>
    </div>
  )
}
