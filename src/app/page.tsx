"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, Users, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center rotate-12">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              mach<span className="text-pink-500">.</span>halt
            </span>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 font-bold">
            null registrierung
          </Badge>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
          {/* Title */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tight">
              <span className="block text-pink-500 transform -rotate-2 inline-block">zusammen</span>
              <span className="block text-purple-600 transform rotate-1 inline-block">sachen</span>
              <span className="block text-blue-600 transform -rotate-1 inline-block">machen</span>
            </h1>
            <p className="text-2xl text-slate-600 font-medium">
              aber <span className="line-through text-slate-400">kompliziert</span>{" "}
              <span className="bg-yellow-200 px-2 py-1 rounded font-bold">einfach</span>
            </p>
          </div>

          {/* Big Central Button */}
          <div className="relative">
            {/* Floating elements */}
            <div className="absolute -top-12 -left-16 opacity-70 transform rotate-12">
              <div className="bg-pink-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-pink-300">
                <span className="text-sm font-bold text-pink-700">✨ instant flow</span>
              </div>
            </div>

            <div className="absolute -top-8 -right-20 opacity-70 transform -rotate-12">
              <div className="flex -space-x-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white shadow-lg">
                  😎
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white shadow-lg">
                  🚀
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 opacity-70 transform rotate-6">
              <div className="bg-purple-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-purple-300">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">live & smooth</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-16 opacity-70 transform -rotate-6">
              <div className="bg-blue-100 rounded-2xl px-4 py-2 shadow-lg border-2 border-blue-300">
                <span className="text-sm font-bold text-blue-700">link → magic</span>
              </div>
            </div>

            {/* The Big Button */}
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white px-16 py-10 text-3xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-white"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Plus className="w-10 h-10 mr-4" />
              MACHEN
              <ArrowRight
                className={`w-8 h-8 ml-4 transition-transform duration-200 ${
                  isHovered ? "translate-x-2 rotate-12" : ""
                }`}
              />
            </Button>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <p className="text-lg text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">0</span> anmeldung •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">∞</span> kollaboration •{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">100%</span> flow
            </p>
            <p className="text-sm text-slate-400 font-mono">{`// einfach link teilen und fertig`}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-slate-400 font-mono">
          made with <span className="text-pink-500">♥</span> and <span className="text-purple-500">good vibes</span>
        </p>
      </footer>
    </div>
  )
}