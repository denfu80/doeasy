"use client"

import { useState } from 'react'
import { X, Link, Copy, QrCode, Eye, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GuestLink } from '@/types/todo'

interface SharingModalProps {
  isOpen: boolean
  onClose: () => void
  listId: string
  listName: string
  guestLinks: GuestLink[]
  onCreateGuestLink: () => void
  onRevokeGuestLink: (linkId: string) => void
}

export default function SharingModal({
  isOpen,
  onClose,
  listId,
  listName,
  guestLinks,
  onCreateGuestLink,
  onRevokeGuestLink
}: SharingModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

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

  const showQRCode = (text: string) => {
    setShowQR(text)
    // Auto-close QR after 10 seconds
    setTimeout(() => setShowQR(null), 10000)
  }

  if (!isOpen) return null

  const activeGuestLinks = guestLinks.filter(link => !link.revoked)

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
                onClick={() => showQRCode(normalLink)}
                size="sm"
                variant="outline"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Guest Link Card */}
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
                              onClick={() => showQRCode(guestLink)}
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