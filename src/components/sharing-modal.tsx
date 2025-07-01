"use client"

import { useState, useEffect } from 'react'
import { X, Link, Users, Crown, Copy, QrCode, Eye, Key, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Admin, GuestLink, UserRole, PasswordSettings } from '@/types/todo'

interface SharingModalProps {
  isOpen: boolean
  onClose: () => void
  listId: string
  listName: string
  currentUserRole: UserRole
  admins: Admin[]
  guestLinks: GuestLink[]
  passwordSettings: PasswordSettings
  onCreateGuestLink: () => void
  onRevokeGuestLink: (linkId: string) => void
  onClaimAdmin: (password?: string) => void
  onSetPassword: (type: 'admin' | 'normal' | 'guest', password: string) => void
}

export default function SharingModal({
  isOpen,
  onClose,
  listId,
  listName,
  currentUserRole,
  admins,
  guestLinks,
  passwordSettings,
  onCreateGuestLink,
  onRevokeGuestLink,
  onClaimAdmin,
  onSetPassword
}: SharingModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [isClaimingAdmin, setIsClaimingAdmin] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [showPasswordSettings, setShowPasswordSettings] = useState(false)
  const [newPasswords, setNewPasswords] = useState({
    admin: '',
    normal: '',
    guest: ''
  })

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const normalLink = `${baseUrl}/list/${listId}`
  
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const showQRCode = (text: string, type: string) => {
    setShowQR(text)
    // Auto-close QR after 10 seconds
    setTimeout(() => setShowQR(null), 10000)
  }

  // Helper functions
  const handleClaimAdmin = async () => {
    try {
      setClaimError('')
      await onClaimAdmin(adminPassword)
      setIsClaimingAdmin(false)
      setAdminPassword('')
    } catch (error: any) {
      setClaimError(error.message || 'Falsches Passwort')
    }
  }

  const handleSavePasswords = async () => {
    try {
      // Save all three passwords
      const promises = []
      if (newPasswords.admin !== passwordSettings.adminPassword) {
        promises.push(onSetPassword('admin', newPasswords.admin))
      }
      if (newPasswords.normal !== passwordSettings.normalPassword) {
        promises.push(onSetPassword('normal', newPasswords.normal))
      }
      if (newPasswords.guest !== passwordSettings.guestPassword) {
        promises.push(onSetPassword('guest', newPasswords.guest))
      }
      
      await Promise.all(promises)
      setShowPasswordSettings(false)
      setNewPasswords({ admin: '', normal: '', guest: '' })
    } catch (error) {
      console.error('Failed to save passwords:', error)
    }
  }

  if (!isOpen) return null

  const activeGuestLinks = guestLinks.filter(link => !link.revoked)
  const isAdmin = currentUserRole === 'admin'
  const hasAdmins = admins.length > 0
  const hasPasswordProtection = passwordSettings.enabledModes?.adminPasswordEnabled || passwordSettings.enabledModes?.normalPasswordEnabled || passwordSettings.enabledModes?.guestPasswordEnabled

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Liste teilen</h2>
              <p className="text-sm text-slate-500 font-mono">{listName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Normal Link Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Normal teilen</h3>
                  <p className="text-sm text-slate-600">Vollzugang zur Liste</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => copyToClipboard(normalLink, 'normal')}
                size="sm"
                className="flex-1"
                variant={copied === 'normal' ? 'default' : 'outline'}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied === 'normal' ? 'Kopiert!' : 'Link kopieren'}
              </Button>
              <Button
                onClick={() => showQRCode(normalLink, 'normal')}
                size="sm"
                variant="outline"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Guest Link Card - Only for Admins */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Gast-Links</h3>
                    <p className="text-sm text-slate-600">Nur lesen & abhaken</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {activeGuestLinks.length} aktiv
                </Badge>
              </div>

              {/* Active Guest Links */}
              {activeGuestLinks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {activeGuestLinks.map((link) => {
                    const guestLink = `${baseUrl}/list/${listId}/guest/${link.id}`
                    return (
                      <div key={link.id} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">
                              {listName} (readonly)
                            </p>
                            <p className="text-xs text-slate-500">
                              Erstellt: {new Date(typeof link.createdAt === 'number' ? link.createdAt : Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              onClick={() => copyToClipboard(guestLink, `guest-${link.id}`)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => showQRCode(guestLink, `guest-${link.id}`)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <QrCode className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => onRevokeGuestLink(link.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Create Guest Link Button */}
              <Button
                onClick={onCreateGuestLink}
                size="sm"
                className="w-full"
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Neuen Gast-Link erstellen
              </Button>
            </div>
          )}

          {/* Admin Claim Card - Only for Non-Admins */}
          {!isAdmin && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Admin werden</h3>
                    <p className="text-sm text-slate-600">
                      {hasAdmins ? 'Admin-Passwort eingeben' : 'Liste übernehmen'}
                    </p>
                  </div>
                </div>
                {hasAdmins && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {admins.length} Admin{admins.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {/* Admin Password Input */}
              {isClaimingAdmin && hasAdmins ? (
                <div className="space-y-3">
                  <div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin-Passwort eingeben..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleClaimAdmin()
                        } else if (e.key === 'Escape') {
                          setIsClaimingAdmin(false)
                          setAdminPassword('')
                          setClaimError('')
                        }
                      }}
                      autoFocus
                    />
                    {claimError && (
                      <p className="text-red-500 text-xs mt-1">{claimError}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleClaimAdmin}
                      size="sm"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Übernehmen
                    </Button>
                    <Button
                      onClick={() => {
                        setIsClaimingAdmin(false)
                        setAdminPassword('')
                        setClaimError('')
                      }}
                      size="sm"
                      variant="outline"
                      className="px-3"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    if (hasAdmins) {
                      setIsClaimingAdmin(true)
                    } else {
                      onClaimAdmin()
                    }
                  }}
                  size="sm"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {hasAdmins ? 'Admin-Passwort eingeben' : 'Jetzt übernehmen'}
                </Button>
              )}
            </div>
          )}

          {/* Password Settings Card - Only for Admins */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Passwort-Schutz</h3>
                    <p className="text-sm text-slate-600">
                      {hasPasswordProtection ? 'Passwörter aktiv' : 'Zusätzliche Sicherheit'}
                    </p>
                  </div>
                </div>
                {hasPasswordProtection && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Aktiv
                  </Badge>
                )}
              </div>
              
              {!showPasswordSettings ? (
                <Button
                  onClick={() => setShowPasswordSettings(true)}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Passwörter verwalten
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-gray-600 mb-2">
                    Leer lassen um Passwort-Schutz zu deaktivieren
                  </div>
                  
                  {/* Admin Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Admin-Passwort
                    </label>
                    <input
                      type="password"
                      value={newPasswords.admin}
                      onChange={(e) => setNewPasswords({...newPasswords, admin: e.target.value})}
                      placeholder="Admin-Berechtigung..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Normal Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Normal-Passwort
                    </label>
                    <input
                      type="password"
                      value={newPasswords.normal}
                      onChange={(e) => setNewPasswords({...newPasswords, normal: e.target.value})}
                      placeholder="Vollzugang..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Guest Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gast-Passwort
                    </label>
                    <input
                      type="password"
                      value={newPasswords.guest}
                      onChange={(e) => setNewPasswords({...newPasswords, guest: e.target.value})}
                      placeholder="Nur lesen..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={handleSavePasswords}
                      size="sm"
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Speichern
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordSettings(false)
                        setNewPasswords({ admin: '', normal: '', guest: '' })
                      }}
                      size="sm"
                      variant="outline"
                      className="px-3"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
              <h3 className="font-semibold text-lg mb-4">QR-Code</h3>
              <div className="bg-gray-100 rounded-xl p-4 mb-4 flex items-center justify-center min-h-[200px]">
                <p className="text-gray-500">QR-Code wird hier angezeigt</p>
                {/* TODO: Implement actual QR code generation */}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Handy zeigen zum Scannen
              </p>
              <Button onClick={() => setShowQR(null)} className="w-full">
                Schließen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}