'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore, ChatMessage } from '@/lib/store'

interface ChatProps {
  convoyId: string
}

// ============================================
// Einzelne Chat-Nachricht
// ============================================

function ChatBubble({ 
  message, 
  isOwn 
}: { 
  message: ChatMessage
  isOwn: boolean 
}) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {/* Avatar */}
        <div 
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
            ${isOwn 
              ? 'bg-teal-100 dark:bg-teal-900' 
              : 'bg-gray-100 dark:bg-gray-700'
            }
          `}
        >
          {message.userAvatar || message.userName.charAt(0)}
        </div>

        {/* Nachricht */}
        <div>
          {/* Name (nur bei fremden Nachrichten) */}
          {!isOwn && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
              {message.userName}
            </p>
          )}
          
          {/* Bubble */}
          <div
            className={`
              px-4 py-2 rounded-2xl
              ${isOwn 
                ? 'bg-teal-500 text-white rounded-br-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
              }
            `}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          
          {/* Zeitstempel */}
          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-2' : 'ml-2'}`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Chat Komponente
// ============================================

export default function Chat({ convoyId }: ChatProps) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Zustand Store
  const user = useStore((state) => state.user)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const messages = useStore((state) => state.messages[convoyId] || [])
  const sendMessage = useStore((state) => state.sendMessage)

  // Auto-scroll zu neuen Nachrichten
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Nachricht senden
  const handleSend = () => {
    if (!inputValue.trim() || !isAuthenticated) return
    
    sendMessage(convoyId, inputValue)
    setInputValue('')
    inputRef.current?.focus()
  }

  // Enter-Taste zum Senden
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {t('chat.title')}
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {messages.length} {t('chat.messages')}
          </span>
        </div>
      </div>

      {/* Nachrichten-Bereich */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-2">💭</span>
            <p className="text-sm">{t('chat.empty')}</p>
            <p className="text-xs">{t('chat.startConversation')}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isOwn={message.userId === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Eingabe-Bereich */}
      <div className="p-3 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('chat.loginRequired')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


