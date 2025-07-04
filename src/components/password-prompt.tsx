"use client"

import React, { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PasswordPromptProps {
  listName: string
  requiredRole: 'normal' | 'guest'
  onPasswordSubmit: (password: string) => void
  onCancel: () => void
  error?: string
  isLoading?: boolean
}

export default function PasswordPrompt({
  listName,
  requiredRole,
  onPasswordSubmit,
  onCancel,
  error,
  isLoading = false
}: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim() && !isLoading) {
      onPasswordSubmit(password.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  useEffect(() => {
    // Focus the input when component mounts
    const input = document.getElementById('password-input')
    if (input) {
      input.focus()
    }
  }, [])

  const roleText = requiredRole === 'normal' ? 'Vollzugang' : 'Gast-Zugang'
  const roleIcon = requiredRole === 'normal' ? Lock : Eye

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {React.createElement(roleIcon, { className: "w-8 h-8 text-white" })}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Passwort erforderlich
          </h1>
          <p className="text-slate-600">
            Diese Liste ist passwortgeschützt
          </p>
          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-800">{listName}</p>
            <p className="text-xs text-purple-600">{roleText}</p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Passwort eingeben..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-400 focus:outline-none transition-colors"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Prüfen...
                </div>
              ) : (
                'Zugang gewähren'
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="px-6 py-3 rounded-xl"
            >
              Abbrechen
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Drücke Escape zum Abbrechen
          </p>
        </div>
      </div>
    </div>
  )
}