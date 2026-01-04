'use client'

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Message } from '../components/chat/ChatInterface'

export interface UseChatProps {
  onSendMessage?: (message: string) => Promise<{ success: boolean; response?: string; error?: string }>
}

export const useChat = ({ onSendMessage }: UseChatProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        if (onSendMessage) {
          const result = await onSendMessage(content.trim())

          if (result.success && result.response) {
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: result.response,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
          } else if (result.error) {
            const errorMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: `エラーが発生しました: ${result.error}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        }
      } catch (error) {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, onSendMessage]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage,
    clearMessages,
  }
}

