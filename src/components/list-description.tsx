"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Edit2, Check, X, FileText } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ListDescriptionProps {
  description: string
  onSave: (newDescription: string) => void
  readOnly?: boolean
}

export default function ListDescription({
  description,
  onSave,
  readOnly = false
}: ListDescriptionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(description)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update edit value when description changes
  useEffect(() => {
    setEditValue(description)
  }, [description])

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      )
    }
  }, [isEditing])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editValue, isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed.length > 500) {
      return
    }
    onSave(trimmed)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(description)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  const isEmpty = !description.trim()

  // Don't render if empty and read-only
  if (isEmpty && readOnly) {
    return null
  }

  const handleEdit = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
    }
    setIsEditing(true)
  }

  return (
    <div className="relative">
      {/* Toggle Button - floating on top right */}
      {!isEmpty && !readOnly && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -top-2 right-2 z-10 p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-all shadow-sm border border-purple-100"
          title={isCollapsed ? 'Beschreibung anzeigen' : 'Beschreibung ausblenden'}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Content Box */}
      {!isCollapsed && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100 shadow-sm p-4">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 bg-white border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm text-slate-700 font-mono resize-none min-h-[100px]"
                placeholder="Markdown wird unterstützt:\n# Überschrift\n**fett** *kursiv*\n- Liste\n- [ ] Todo"
              />

              <div className="flex items-center justify-between">
                <p className={`text-xs font-mono ${
                  editValue.length > 500 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {editValue.length > 500
                    ? `// zu lang: ${editValue.length}/500 zeichen`
                    : `// cmd/ctrl+enter = speichern, esc = abbrechen (${editValue.length}/500)`
                  }
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>abbrechen</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={editValue.length > 500}
                    className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors flex items-center space-x-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3 h-3" />
                    <span>speichern</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isEmpty ? (
            // Empty State
            <button
              onClick={() => !readOnly && handleEdit()}
              disabled={readOnly}
              className="w-full py-6 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-300 hover:bg-purple-100/50 transition-all text-center group disabled:cursor-not-allowed disabled:hover:border-purple-200 disabled:hover:bg-transparent"
            >
              <Edit2 className="w-6 h-6 text-purple-300 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-purple-500 font-medium group-hover:text-purple-600 transition-colors">
                {readOnly ? 'Keine Beschreibung' : 'Beschreibung hinzufügen'}
              </p>
              <p className="text-xs text-purple-400 mt-1 font-mono">
                // markdown unterstützt
              </p>
            </button>
          ) : (
            // View Mode
            <div
              className={`prose prose-sm prose-purple max-w-none rounded-lg transition-colors group ${
                readOnly ? '' : 'cursor-pointer hover:bg-purple-100/50 -m-4 p-4'
              }`}
              onClick={() => !readOnly && handleEdit()}
            >
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-lg font-bold text-purple-800 mb-2" {...props} />,
                  h2: ({...props}) => <h2 className="text-base font-bold text-purple-700 mb-2" {...props} />,
                  h3: ({...props}) => <h3 className="text-sm font-bold text-purple-600 mb-1" {...props} />,
                  p: ({...props}) => <p className="text-sm text-slate-700 mb-2 leading-relaxed" {...props} />,
                  ul: ({...props}) => <ul className="text-sm text-slate-700 space-y-1 mb-2 list-disc list-inside" {...props} />,
                  ol: ({...props}) => <ol className="text-sm text-slate-700 space-y-1 mb-2 list-decimal list-inside" {...props} />,
                  li: ({...props}) => <li className="text-sm text-slate-700" {...props} />,
                  strong: ({...props}) => <strong className="font-bold text-purple-700" {...props} />,
                  em: ({...props}) => <em className="italic text-purple-600" {...props} />,
                  code: ({...props}) => <code className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-mono text-xs" {...props} />,
                  blockquote: ({...props}) => <blockquote className="border-l-4 border-purple-300 pl-3 italic text-slate-600 text-sm" {...props} />,
                  a: ({...props}) => <a className="text-purple-600 hover:text-purple-700 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                }}
              >
                {description}
              </Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
