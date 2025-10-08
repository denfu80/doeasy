"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Link as LinkIcon, Copy, Eye, Users, Calendar, Lock, User, Power, Edit, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ref, onValue, off, set, update, remove } from 'firebase/database'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { GuestLink } from '@/types/todo'
import GuestLinkForm from './guest-link-form'

interface GuestLinkFormData {
  name?: string
  guestDisplayName?: string
  expiresInDays: number | null
  password?: string
}

interface SharingPageProps {
  listId: string
}

export default function SharingPage({ listId }: SharingPageProps) {
  const router = useRouter()
  const [listName, setListName] = useState<string>('')
  const [guestLinks, setGuestLinks] = useState<GuestLink[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [showGuestLinkForm, setShowGuestLinkForm] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const normalLink = `${baseUrl}/list/${listId}`

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      setIsLoading(false)
      return
    }

    // Load list metadata (name)
    const metadataRef = ref(db, `lists/${listId}/metadata/name`)
    const metadataUnsubscribe = onValue(metadataRef, (snapshot) => {
      const name = snapshot.val()
      setListName(name || listId)
      setIsLoading(false)
    })

    // Load guest links (top-level path, filtered by listId)
    const guestLinksRef = ref(db, `guestLinks`)
    const guestLinksUnsubscribe = onValue(guestLinksRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const links = Object.entries(data)
          .map(([id, link]: [string, any]) => ({
            id,
            ...link
          }))
          .filter((link: any) => link.listId === listId)
        setGuestLinks(links)
      } else {
        setGuestLinks([])
      }
    })

    return () => {
      off(metadataRef)
      off(guestLinksRef)
      metadataUnsubscribe()
      guestLinksUnsubscribe()
    }
  }, [listId])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCreateGuestLink = async (data: GuestLinkFormData) => {
    if (!isFirebaseConfigured() || !db || !auth) return

    const currentUser = auth.currentUser

    const guestLinkId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = data.expiresInDays ? Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000 : null

    const newGuestLink: any = {
      listId,
      createdBy: currentUser?.uid || 'anonymous',
      createdAt: Date.now(),
      revoked: false,
      lastAccessAt: null,
      accessCount: 0
    }

    // Only add optional fields if they have values
    if (data.name) newGuestLink.name = data.name
    if (data.guestDisplayName) newGuestLink.guestDisplayName = data.guestDisplayName
    if (data.password) newGuestLink.password = data.password
    if (expiresAt) newGuestLink.expiresAt = expiresAt

    await set(ref(db, `guestLinks/${guestLinkId}`), newGuestLink)
    setShowGuestLinkForm(false)
  }

  const handleEditGuestLink = async (linkId: string, data: GuestLinkFormData) => {
    if (!isFirebaseConfigured() || !db) return

    const expiresAt = data.expiresInDays ? Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000 : null

    await update(ref(db, `guestLinks/${linkId}`), {
      name: data.name,
      guestDisplayName: data.guestDisplayName || null,
      password: data.password || null,
      expiresAt,
      updatedAt: Date.now()
    })
    setEditingLinkId(null)
  }

  const handleRevokeGuestLink = async (linkId: string) => {
    if (!isFirebaseConfigured() || !db) return
    await remove(ref(db, `guestLinks/${linkId}`))
  }

  const handleToggleGuestLink = async (linkId: string, disabled: boolean) => {
    if (!isFirebaseConfigured() || !db) return
    await update(ref(db, `guestLinks/${linkId}`), {
      disabled,
      updatedAt: Date.now()
    })
  }

  const isLinkExpired = (link: GuestLink) => {
    if (!link.expiresAt) return false
    return link.expiresAt < Date.now()
  }

  const getEditingLink = () => {
    if (!editingLinkId) return null
    return guestLinks.find(link => link.id === editingLinkId)
  }

  const activeGuestLinks = guestLinks.filter(link => !link.revoked)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-600">
          <div className="w-8 h-8 bg-purple-500 rounded-full animate-spin flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold">Wird geladen...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        {/* Mobile Header (<md) */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/list/${listId}`)}
              className="text-slate-600 hover:text-slate-900 hover:bg-purple-100 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück
            </Button>
          </div>
        </div>

        {/* Desktop Header (≥md) */}
        <div className="hidden md:block container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/list/${listId}`)}
                className="text-slate-600 hover:text-slate-900 hover:bg-purple-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>

              <Link
                href="/"
                className="flex items-center space-x-2 group cursor-pointer"
                title="Zur Startseite"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-200">
                    <span className="font-black">mach<span className="text-pink-500">.</span>einfach</span> / Teilen
                  </h1>
                  <p className="text-sm text-slate-500 font-mono">{listName}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">

        {/* Normal Link Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Normal teilen</h3>
                <p className="text-sm text-slate-600">Vollzugang zur Liste</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => copyToClipboard(normalLink, 'normal')}
            size="sm"
            className="w-full"
            variant={copied === 'normal' ? 'default' : 'outline'}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied === 'normal' ? 'Kopiert!' : 'Link kopieren'}
          </Button>
        </div>

        {/* Guest Link Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Gast-Links</h3>
                <p className="text-sm text-slate-600">Nur lesen & abhaken • Kein Passwortschutz</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {activeGuestLinks.length} aktiv
            </Badge>
          </div>

          {/* Active Guest Links */}
          {activeGuestLinks.length > 0 && (
            <div className="space-y-3 mb-4">
              {activeGuestLinks.map((link) => {
                const guestLink = `${baseUrl}/guest/${link.id}`
                const expired = isLinkExpired(link)
                const isDisabled = link.disabled || false
                return (
                  <div key={link.id} className={`bg-white rounded-lg p-4 border ${expired ? 'border-red-200 bg-red-50' : isDisabled ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm text-slate-800 truncate">
                              {link.name || `${listName} (readonly)`}
                            </p>
                            {expired && (
                              <Badge variant="destructive" className="text-xs">Abgelaufen</Badge>
                            )}
                            {isDisabled && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Deaktiviert</Badge>
                            )}
                            {link.password && (
                              <Lock className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-xs text-slate-500">
                              Erstellt: {new Date(typeof link.createdAt === 'number' ? link.createdAt : Date.now()).toLocaleDateString('de-DE')}
                            </p>
                            {link.expiresAt && (
                              <p className={`text-xs flex items-center space-x-1 ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                                <Calendar className="w-3 h-3" />
                                <span>Läuft ab: {new Date(link.expiresAt).toLocaleDateString('de-DE')}</span>
                              </p>
                            )}
                          </div>
                          {link.guestDisplayName && (
                            <p className="text-xs text-purple-600 flex items-center space-x-1 mt-1">
                              <User className="w-3 h-3" />
                              <span>Gast-Name: {link.guestDisplayName}</span>
                            </p>
                          )}
                          {link.lastAccessAt && (
                            <p className="text-xs text-slate-400 mt-1">
                              Zuletzt verwendet: {new Date(link.lastAccessAt).toLocaleString('de-DE')}
                              {link.accessCount ? ` • ${link.accessCount}x verwendet` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            onClick={() => handleToggleGuestLink(link.id, !isDisabled)}
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${isDisabled ? 'text-yellow-600' : 'text-green-600'}`}
                            title={isDisabled ? 'Link aktivieren' : 'Link deaktivieren'}
                          >
                            <Power className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => setEditingLinkId(link.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Link bearbeiten"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(guestLink, `guest-${link.id}`)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={expired || isDisabled}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleRevokeGuestLink(link.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Create Guest Link Button */}
          <Button
            onClick={() => setShowGuestLinkForm(true)}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Neuen Gast-Link erstellen
          </Button>
        </div>
      </div>

      {/* Guest Link Form Modal - Create */}
      <GuestLinkForm
        isOpen={showGuestLinkForm}
        onClose={() => setShowGuestLinkForm(false)}
        onSubmit={handleCreateGuestLink}
      />

      {/* Guest Link Form Modal - Edit */}
      {editingLinkId && (
        <GuestLinkForm
          isOpen={true}
          onClose={() => setEditingLinkId(null)}
          onSubmit={(data) => handleEditGuestLink(editingLinkId, data)}
          initialData={{
            name: getEditingLink()?.name,
            guestDisplayName: getEditingLink()?.guestDisplayName,
            expiresInDays: getEditingLink()?.expiresAt
                ? Math.ceil(((getEditingLink()?.expiresAt ?? 0) - Date.now()) / (1000 * 60 * 60 * 24))
                : null,
            password: getEditingLink()?.password || ''
          }}
          isEditing={true}
        />
      )}
    </div>
  )
}
