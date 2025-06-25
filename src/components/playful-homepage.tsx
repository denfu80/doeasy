"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, Users, ArrowRight, Mic, MessageCircle, Share2, Clock } from "lucide-react"
import { useState } from "react"

export default function PlayfulHomepage() {
  const [isHovered, setIsHovered] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [badgeHovered, setBadgeHovered] = useState(false)
  const [titleHovered, setTitleHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
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
              mach<span className="text-pink-500">.</span>halt
            </span>
          </div>
          
          <Badge 
            variant="secondary" 
            className={`bg-yellow-100 text-yellow-800 border-yellow-200 font-bold cursor-pointer transition-all duration-300 ${
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
            className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse cursor-pointer hover:opacity-40 hover:scale-125 transition-all duration-500 hover:animate-spin"
            onClick={() => {/* Feature spoiler: Todo creation */}}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Plus className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          
          <div 
            className="absolute bottom-32 right-16 w-24 h-24 bg-purple-200 rounded-full opacity-30 animate-bounce cursor-pointer hover:opacity-60 hover:scale-150 transition-all duration-500"
            onClick={() => {/* Feature spoiler: Real-time collaboration */}}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Users className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          
          <div 
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25 cursor-pointer hover:opacity-50 hover:scale-110 transition-all duration-300 hover:animate-ping"
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
              className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tight cursor-pointer"
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
                aber <span className="line-through text-slate-400 hover:text-red-500 hover:animate-pulse transition-colors cursor-pointer">kompliziert</span>{" "}
                <span className="bg-yellow-200 px-2 py-1 rounded font-bold hover:bg-green-200 hover:scale-110 transition-all duration-300 cursor-pointer">einfach</span>
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
            <div className="absolute -top-12 -left-16 opacity-70 transform rotate-12 cursor-pointer hover:opacity-100 hover:scale-125 hover:-rotate-12 transition-all duration-500 group">
              <div className="bg-pink-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-pink-300 group-hover:bg-pink-200 group-hover:border-pink-400">
                <span className="text-sm font-bold text-pink-700 group-hover:text-pink-800">
                  ✨ <span className="group-hover:hidden">instant flow</span>
                  <span className="hidden group-hover:inline">voice ready!</span>
                </span>
                <Mic className="w-3 h-3 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />
              </div>
            </div>

            <div className="absolute -top-8 -right-20 opacity-70 transform -rotate-12 cursor-pointer hover:opacity-100 hover:scale-110 hover:rotate-12 transition-all duration-500 group">
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

            <div className="absolute -bottom-12 -right-12 opacity-70 transform rotate-6 cursor-pointer hover:opacity-100 hover:scale-125 hover:-rotate-6 transition-all duration-500 group">
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

            <div className="absolute -bottom-8 -left-16 opacity-70 transform -rotate-6 cursor-pointer hover:opacity-100 hover:scale-125 hover:rotate-6 transition-all duration-500 group">
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
                MACHEN
              </span>
              <ArrowRight
                className={`w-8 h-8 ml-4 transition-all duration-300 ${
                  isHovered ? "translate-x-2 rotate-12 scale-125" : ""
                }`}
              />
            </Button>
          </div>

          {/* Interactive Subtitle */}
          <div className="space-y-2">
            <p className="text-lg text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-green-100 hover:text-green-700 hover:scale-110 transition-all duration-300">0</span> anmeldung •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-purple-100 hover:text-purple-700 hover:scale-110 transition-all duration-300 hover:animate-pulse">∞</span> kollaboration •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 hover:text-blue-700 hover:scale-110 transition-all duration-300">100%</span> flow
            </p>
            <p className="text-sm text-slate-400 font-mono cursor-pointer hover:text-slate-600 hover:scale-105 transition-all duration-300 group">
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
        <p className="text-sm text-slate-400 font-mono cursor-pointer hover:text-slate-600 transition-colors duration-300 group">
          made with <span className="text-pink-500 hover:animate-pulse cursor-pointer">♥</span> and <span className="text-purple-500 hover:animate-bounce cursor-pointer">good vibes</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
            🚀
          </span>
        </p>
      </footer>
    </div>
  )
}