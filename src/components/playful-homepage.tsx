"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, Users, ArrowRight, Mic, Share2, Clock, Pin, PinOff, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { generateReadableId } from "@/lib/readable-id-service"
import { getLocalListIds, addLocalListId, removeLocalListId } from "@/lib/offline-storage"
import { ref, onValue, off } from 'firebase/database'
import { db, isFirebaseConfigured } from '@/lib/firebase'

export default function PlayfulHomepage() {
  const [isHovered, setIsHovered] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [badgeHovered, setBadgeHovered] = useState(false)
  const [titleHovered, setTitleHovered] = useState(false)
  const [localLists, setLocalLists] = useState<string[]>([])
  const [unpinConfirm, setUnpinConfirm] = useState<string | null>(null)
  const [listNames, setListNames] = useState<Record<string, string>>({})
  const [lastActivity, setLastActivity] = useState<Record<string, {timestamp: number, user: string, action?: string}>>({})
  const [passwordProtected, setPasswordProtected] = useState<Record<string, boolean>>({})
  const [, forceUpdate] = useState({})
  const router = useRouter()

  useEffect(() => {
    setLocalLists(getLocalListIds())
  }, [])

  // Load list names and activity from Firebase for all local lists
  useEffect(() => {
    if (!isFirebaseConfigured() || !db || localLists.length === 0) return

    const unsubscribes: (() => void)[] = []

    localLists.forEach(listId => {
      // Listen to list name changes
      const listNameRef = ref(db!, `lists/${listId}/metadata/name`)
      const nameUnsubscribe = onValue(listNameRef, (snapshot) => {
        const name = snapshot.val()
        setListNames(prev => ({
          ...prev,
          [listId]: name || listId
        }))
      })
      
      // Listen to todos to track last activity
      const todosRef = ref(db!, `lists/${listId}/todos`)
      const activityUnsubscribe = onValue(todosRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          let latestTimestamp = 0
          let latestUser = 'Unknown'
          let latestAction = 'created'
          
          Object.values(data).forEach((todo: any) => {
            // Check creation time
            if (todo.createdAt && typeof todo.createdAt === 'number' && todo.createdAt > latestTimestamp) {
              latestTimestamp = todo.createdAt
              latestUser = todo.creatorName || 'Unknown'
              latestAction = 'created'
            }
            
            // Check completion toggle (when completed timestamp exists)
            if (todo.completedAt && typeof todo.completedAt === 'number' && todo.completedAt > latestTimestamp) {
              latestTimestamp = todo.completedAt
              latestUser = todo.completedBy || latestUser
              latestAction = todo.completed ? 'completed' : 'uncompleted'
            }
            
            // Check text updates (when updatedAt exists)
            if (todo.updatedAt && typeof todo.updatedAt === 'number' && todo.updatedAt > latestTimestamp) {
              latestTimestamp = todo.updatedAt
              latestUser = todo.updatedBy || latestUser
              latestAction = 'updated'
            }
            
            // Check deletion (when deletedAt exists)
            if (todo.deletedAt && typeof todo.deletedAt === 'number' && todo.deletedAt > latestTimestamp) {
              latestTimestamp = todo.deletedAt
              latestUser = todo.deletedBy || latestUser
              latestAction = 'deleted'
            }
            
            // Check restoration (when restoredAt exists)
            if (todo.restoredAt && typeof todo.restoredAt === 'number' && todo.restoredAt > latestTimestamp) {
              latestTimestamp = todo.restoredAt
              latestUser = todo.restoredBy || latestUser
              latestAction = 'restored'
            }
          })
          
          if (latestTimestamp > 0) {
            setLastActivity(prev => ({
              ...prev,
              [listId]: { timestamp: latestTimestamp, user: latestUser, action: latestAction }
            }))
          }
        }
      })

      // Listen to password protection status
      const passwordRef = ref(db!, `lists/${listId}/metadata/password`)
      const passwordUnsubscribe = onValue(passwordRef, (snapshot) => {
        const passwordData = snapshot.val()
        const hasPassword = !!passwordData?.hashedPassword
        setPasswordProtected(prev => ({
          ...prev,
          [listId]: hasPassword
        }))
      })

      unsubscribes.push(() => off(listNameRef, 'value', nameUnsubscribe))
      unsubscribes.push(() => off(todosRef, 'value', activityUnsubscribe))
      unsubscribes.push(() => off(passwordRef, 'value', passwordUnsubscribe))
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [localLists])

  // Update time strings every minute
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({})
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const createNewList = () => {
    const listId = generateReadableId()
    addLocalListId(listId) // Save new list ID
    router.push(`/list/${listId}`)
  }

  const navigateToList = (listId: string) => {
    addLocalListId(listId) // Ensure it's tracked if accessed directly or from a shared link previously
    router.push(`/list/${listId}`)
  }

  const handleUnpinClick = (listId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent navigation when unpinning
    if (unpinConfirm === listId) {
      // Second click - actually unpin from this browser
      removeLocalListId(listId)
      setLocalLists(getLocalListIds()) // Refresh the list
      setUnpinConfirm(null)
    } else {
      // First click - show confirm state
      setUnpinConfirm(listId)
      // Auto-reset after 3 seconds
      setTimeout(() => setUnpinConfirm(null), 3000)
    }
  }

  const getListName = (listId: string): string => {
    return listNames[listId] || listId
  }

  const formatLastActivity = (listId: string): string => {
    const activity = lastActivity[listId]
    if (!activity) return '// keine aktivität'
    
    const now = Date.now()
    const diff = now - activity.timestamp
    
    // Time formatting
    let timeStr = ''
    if (diff < 60000) { // < 1 minute
      timeStr = 'gerade eben'
    } else if (diff < 3600000) { // < 1 hour
      const minutes = Math.floor(diff / 60000)
      timeStr = `vor ${minutes}m`
    } else if (diff < 86400000) { // < 1 day
      const hours = Math.floor(diff / 3600000)
      timeStr = `vor ${hours}h`
    } else if (diff < 604800000) { // < 1 week
      const days = Math.floor(diff / 86400000)
      timeStr = `vor ${days}d`
    } else {
      // Format as date
      const date = new Date(activity.timestamp)
      timeStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
    }
    
    // Shortened action descriptions
    const actionMap = {
      'created': 'hinzugefügt',
      'updated': 'bearbeitet', 
      'completed': 'abgehakt',
      'uncompleted': 'aktiviert',
      'deleted': 'gelöscht',
      'restored': 'wiederhergestellt'
    }
    
    const actionText = activity.action ? actionMap[activity.action as keyof typeof actionMap] || 'geändert' : 'geändert'
    
    // Shorten user name if too long
    const shortUser = activity.user.length > 8 ? activity.user.substring(0, 8) + '...' : activity.user
    
    return `// ${shortUser} ${actionText} ${timeStr}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2 group"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div className={`w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 ${
              logoHovered ? 'rotate-180 scale-125 shadow-lg' : 'rotate-12'
            }`}>
              <Zap className={`w-5 h-5 text-white transition-all duration-300 ${
                logoHovered ? 'animate-pulse' : ''
              }`} />
            </div>
            <span className={`text-xl font-black text-slate-900 tracking-tight transition-all duration-300 ${
              logoHovered ? 'text-2xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent' : ''
            }`}>
              mach<span className="text-pink-500">.</span>einfach
            </span>
          </div>
          
          <Badge
            variant="secondary"
            className={`bg-yellow-100 text-yellow-800 border-yellow-200 font-bold transition-all duration-300 ${
              badgeHovered ? 'bg-green-100 text-green-800 border-green-200 scale-110 shadow-lg' : ''
            }`}
            onMouseEnter={() => setBadgeHovered(true)}
            onMouseLeave={() => setBadgeHovered(false)}
          >
            {badgeHovered ? '🚀 instant start' : 'null registrierung'}
          </Badge>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 relative">
        {/* Interactive Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse hover:opacity-40 hover:scale-125 transition-all duration-500 hover:animate-spin"
            onClick={() => {/* Feature spoiler: Todo creation */}}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Plus className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          
          <div
            className="absolute bottom-32 right-16 w-24 h-24 bg-purple-200 rounded-full opacity-30 animate-bounce hover:opacity-60 hover:scale-150 transition-all duration-500"
            onClick={() => {/* Feature spoiler: Real-time collaboration */}}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Users className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          
          <div
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25 hover:opacity-50 hover:scale-110 transition-all duration-300 hover:animate-ping"
            onClick={() => {/* Feature spoiler: Sharing */}}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Share2 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
          {/* Interactive Title */}
          <div className="space-y-6">
            <h1
              className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tight"
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
            >
              <span className={`block text-pink-500 transform inline-block transition-all duration-300 ${
                titleHovered ? '-rotate-6 scale-105' : '-rotate-2'
              }`}>
                zusammen
              </span>
              <span className={`block text-purple-600 transform inline-block transition-all duration-300 ${
                titleHovered ? 'rotate-6 scale-105' : 'rotate-1'
              }`}>
                sachen
              </span>
              <span className={`block text-blue-600 transform inline-block transition-all duration-300 ${
                titleHovered ? '-rotate-3 scale-105' : '-rotate-1'
              }`}>
                machen
              </span>
            </h1>
            
            <div className="relative">
              <p className="text-2xl text-slate-600 font-medium">
                aber <span className="line-through text-slate-400 hover:text-red-500 hover:animate-pulse transition-colors">kompliziert</span>{" "}
                <span className="bg-yellow-200 px-2 py-1 rounded font-bold hover:bg-green-200 hover:scale-110 transition-all duration-300">einfach</span>
              </p>
              
              {/* Title hover spoiler */}
              {titleHovered && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold animate-bounce z-50">
                  🎯 Real-time Collaboration Ready!
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-500 rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          {/* Big Central Button */}
          <div className="relative">
            {/* Interactive Floating Elements */}
            <div className="absolute -top-12 -left-16 opacity-70 transform rotate-12 hover:opacity-100 hover:scale-125 hover:-rotate-12 transition-all duration-500 group">
              <div className="bg-pink-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-pink-300 group-hover:bg-pink-200 group-hover:border-pink-400">
                <span className="text-sm font-bold text-pink-700 group-hover:text-pink-800">
                  ✨ <span className="group-hover:hidden">instant flow</span>
                  <span className="hidden group-hover:inline">voice ready!</span>
                </span>
                <Mic className="w-3 h-3 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />
              </div>
            </div>

            <div className="absolute -top-8 -right-20 opacity-70 transform -rotate-12 hover:opacity-100 hover:scale-110 hover:rotate-12 transition-all duration-500 group">
              <div className="flex -space-x-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white shadow-lg group-hover:animate-spin">
                  <span className="group-hover:hidden">😎</span>
                  <Clock className="w-5 h-5 hidden group-hover:block" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white shadow-lg group-hover:animate-bounce">
                  🚀
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 opacity-70 transform rotate-6 hover:opacity-100 hover:scale-125 hover:-rotate-6 transition-all duration-500 group">
              <div className="bg-purple-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-purple-300 group-hover:bg-purple-200 group-hover:border-purple-400">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600 group-hover:animate-pulse" />
                  <span className="text-sm font-bold text-purple-700 group-hover:text-purple-800">
                    <span className="group-hover:hidden">live & smooth</span>
                    <span className="hidden group-hover:inline">∞ users!</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-16 opacity-70 transform -rotate-6 hover:opacity-100 hover:scale-125 hover:rotate-6 transition-all duration-500 group">
              <div className="bg-blue-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-blue-300 group-hover:bg-blue-200 group-hover:border-blue-400">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold text-blue-700 group-hover:text-blue-800">
                    <span className="group-hover:hidden">link → magic</span>
                    <span className="hidden group-hover:inline">instant share</span>
                  </span>
                  <Share2 className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* The Interactive Big Button */}
            <Button
              size="lg"
              onClick={createNewList}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white px-16 py-10 text-3xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-white"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Plus className={`w-10 h-10 mr-4 transition-all duration-300 ${
                isHovered ? 'rotate-90 scale-125' : ''
              }`} />
              <span className={`transition-all duration-300 ${
                isHovered ? 'tracking-widest' : ''
              }`}>
                {isHovered ? "JETZT" : "MACHEN"}
              </span>
              <ArrowRight
                className={`w-8 h-8 ml-4 transition-all duration-300 ${
                  isHovered ? "translate-x-2 rotate-12 scale-125" : ""
                }`}
              />
            </Button>
          </div>

          {/* Floating Memory Cards - Local Lists */}
          {localLists.length > 0 && (
            <div className="mt-16 relative">
              {/* Magic Header with floating particles */}
              <div className="text-center mb-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 translate-x-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-x-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                
                <h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent inline-block">
                  📌 gepinnte listen
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-mono">{`// in diesem browser gespeichert`}</p>
              </div>

              {/* Floating Memory Cards */}
              <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                {localLists.map((listId, index) => (
                  <div
                    key={listId}
                    className="group relative animate-fadeInUp"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animationDuration: '0.6s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {/* Memory Card */}
                    <div
                      className="relative overflow-hidden bg-gradient-to-br from-white via-pink-50 to-purple-50 backdrop-blur-lg rounded-2xl p-4 min-w-[180px] shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-500 group-hover:from-pink-100 group-hover:via-purple-100 group-hover:to-blue-100 cursor-pointer"
                      onClick={() => navigateToList(listId)}
                    >
                      {/* Floating sparkles */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                      </div>
                      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Gradient border glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {/* Password indicator - appears on hover */}
                            {passwordProtected[listId] && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100 border border-green-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                                title="Diese Liste ist passwortgeschützt"
                              >
                                <Lock className="w-3 h-3 text-green-600" />
                              </div>
                            )}

                            {/* Unpin Button - appears on hover */}
                            <button
                              onClick={(e) => handleUnpinClick(listId, e)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md ${
                                unpinConfirm === listId
                                  ? 'bg-orange-500 animate-pulse'
                                  : 'bg-orange-400 hover:bg-orange-500'
                              }`}
                              title={unpinConfirm === listId ? 'Nochmal klicken zum Entpinnen' : `"${getListName(listId)}" aus diesem Browser entpinnen`}
                            >
                              <PinOff className="w-3 h-3 text-white" />
                            </button>

                            {/* Arrow - shows when not hovering buttons */}
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-purple-600 transition-all duration-300" />
                          </div>
                        </div>
                        
                        <div className="text-left">
                          {/* List Name - read only */}
                          <p className="font-bold text-slate-700 text-sm leading-tight group-hover:text-purple-700 transition-colors duration-300">
                            {getListName(listId)}
                          </p>

                          <div className="relative min-h-[20px] mt-1">
                            <p className={`text-xs font-mono transition-opacity duration-300 ${
                              unpinConfirm === listId
                                ? 'opacity-0'
                                : 'text-slate-500 group-hover:text-purple-500'
                            }`}>
                              {formatLastActivity(listId)}
                            </p>

                            {unpinConfirm === listId && (
                              <p className="absolute inset-0 text-xs font-mono text-orange-500 animate-pulse">
                                {`// nochmal klicken zum entpinnen?`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Magic floating elements around card */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-all duration-300"></div>
                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-pulse transition-all duration-500"></div>
                  </div>
                ))}
                
                {/* Add magical "create new" hint if less than 3 lists */}
                {localLists.length < 3 && (
                  <button
                    onClick={createNewList}
                    className="flex items-center justify-center min-w-[180px] h-[100px] rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 backdrop-blur-sm hover:border-purple-300 hover:bg-purple-100/50 transition-all duration-300 group cursor-pointer hover:scale-105 hover:rotate-1"
                  >
                    <div className="text-center">
                      <Plus className="w-6 h-6 text-purple-400 mx-auto mb-1 group-hover:scale-125 group-hover:text-purple-600 transition-all duration-300" />
                      <p className="text-xs text-purple-500 font-mono group-hover:text-purple-700 transition-colors duration-300">
                        neue liste
                      </p>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-blue-100/20 rounded-3xl blur-3xl -z-10"></div>
            </div>
          )}

          {/* Interactive Subtitle */}
          <div className="space-y-2 mt-12">
            <p className="text-lg text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded hover:bg-green-100 hover:text-green-700 hover:scale-110 transition-all duration-300">0</span> anmeldung •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded hover:bg-purple-100 hover:text-purple-700 hover:scale-110 transition-all duration-300 hover:animate-pulse">∞</span> kollaboration •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-700 hover:scale-110 transition-all duration-300">100%</span> flow
            </p>
            <p className="text-sm text-slate-400 font-mono hover:text-slate-600 hover:scale-105 transition-all duration-300 group">
              {`// einfach link teilen und fertig`}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                ✨
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Interactive Footer */}
      <footer className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-slate-400 font-mono hover:text-slate-600 transition-colors duration-300 group">
          made with <span className="text-pink-500 hover:animate-pulse">♥</span> and <span className="text-purple-500 hover:animate-bounce">good vibes</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
            🚀
          </span>
        </p>
      </footer>
    </div>
  )
}