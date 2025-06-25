"use client"

import { Button } from "@/components/ui/button"
import { Terminal, ArrowRight, Hash } from "lucide-react"
import { useState, useEffect } from "react"

export default function TerminalHomepage() {
  const [currentLine, setCurrentLine] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const terminalLines = [
    "$ initialisiere mach.halt...",
    "$ lade kollaboration.exe...",
    "$ verbinde teams...",
    "$ ready to machen!",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentLine < terminalLines.length - 1) {
        setCurrentLine((prev) => prev + 1)
      } else {
        setIsTyping(false)
      }
    }, 800)

    return () => clearInterval(timer)
  }, [currentLine])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      {/* Terminal Header */}
      <header className="border-b border-green-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-400 flex items-center justify-center">
              <Hash className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold">mach.halt v2.0.1</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ASCII Art Header */}
        <div className="mb-8">
          <pre className="text-xs md:text-sm text-green-300 leading-tight">
            {`
███╗   ███╗ █████╗  ██████╗██╗  ██╗   ██╗  ██╗ █████╗ ██╗  ████████╗
████╗ ████║██╔══██╗██╔════╝██║  ██║   ██║  ██║██╔══██╗██║  ╚══██╔══╝
██╔████╔██║███████║██║     ███████║   ███████║███████║██║     ██║   
██║╚██╔╝██║██╔══██║██║     ██╔══██║   ██╔══██║██╔══██║██║     ██║   
██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║██╗██║  ██║██║  ██║███████╗██║   
╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝   
`}
          </pre>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Terminal Output */}
          <div className="space-y-6">
            <div className="border border-green-400 bg-gray-900 p-6">
              <div className="space-y-2">
                <div className="text-green-300 mb-4">user@localhost:~$ cat README.md</div>

                <div className="space-y-1 text-sm">
                  <div># ZUSAMMEN.SACHEN.MACHEN</div>
                  <div className="text-gray-400">## aber halt einfach</div>
                  <div></div>
                  <div>- [x] null registrierung</div>
                  <div>- [x] instant kollaboration</div>
                  <div>- [x] link teilen = fertig</div>
                  <div>- [x] live updates</div>
                  <div></div>
                  <div className="text-yellow-400">WARNING: macht süchtig</div>
                </div>
              </div>
            </div>

            {/* Terminal Animation */}
            <div className="border border-green-400 bg-gray-900 p-6">
              <div className="space-y-1">
                {terminalLines.slice(0, currentLine + 1).map((line, index) => (
                  <div key={index} className="text-sm">
                    {line}
                    {index === currentLine && isTyping && <span className="animate-pulse">█</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Action Area */}
          <div className="space-y-8">
            {/* Status Display */}
            <div className="border border-green-400 p-6 bg-gray-900">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>STATUS:</span>
                  <span className="text-green-300">READY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>USERS_ONLINE:</span>
                  <span className="text-yellow-400">1,337</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>LISTS_CREATED:</span>
                  <span className="text-blue-400">42,069</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VIBE_LEVEL:</span>
                  <span className="text-pink-400">MAXIMUM</span>
                </div>
              </div>
            </div>

            {/* Command Input */}
            <div className="space-y-4">
              <div className="text-lg">
                <span className="text-gray-400">user@mach-halt:~$</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-400 hover:bg-green-300 text-black font-bold py-6 text-xl font-mono border-2 border-green-400 hover:border-green-300 transition-all duration-200 group"
              >
                <Terminal className="w-6 h-6 mr-3" />
                ./neue-liste --start
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="text-xs text-gray-400 space-y-1">
                <div>USAGE: ./neue-liste [OPTIONS]</div>
                <div> --start erstelle neue kollaborative liste</div>
                <div> --share teile link mit team</div>
                <div> --help zeige diese hilfe</div>
              </div>
            </div>

            {/* System Info */}
            <div className="border border-green-400 p-4 bg-gray-900 text-xs space-y-1">
              <div>SYSTEM: mach.halt-os v2.0.1</div>
              <div>KERNEL: kollaboration-core 4.2.0</div>
              <div>UPTIME: ∞ (never crashes)</div>
              <div>MEMORY: unlimited vibes</div>
              <div className="text-green-300">{`// einfach machen, nicht denken`}</div>
            </div>
          </div>
        </div>

        {/* Bottom Terminal Bar */}
        <div className="mt-12 border-t border-green-400 pt-4">
          <div className="flex justify-between text-xs">
            <div>
              <span className="text-gray-400">made with</span> <span className="text-red-400">♥</span>{" "}
              <span className="text-gray-400">and</span> <span className="text-blue-400">terminal-addiction</span>
            </div>
            <div className="text-gray-400">press any key to continue...</div>
          </div>
        </div>
      </div>
    </div>
  )
}