'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { ScrollArea } from "@/app/components/ui/scrollarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Globe,StarIcon } from "lucide-react"

interface Message {
  id: string
  content: string
  timestamp: number
  username: string
  avatarUrl: string
  countryCode: string
}

export default function AnonymousMessaging() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [countryCode, setCountryCode] = useState('')

  useEffect(() => {
    // Load messages from local storage when the component mounts
    const storedMessages = localStorage.getItem('anonymousMessages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    // Load user info from local storage
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
    }
    const storedAvatarUrl = localStorage.getItem('avatarUrl')
    if (storedAvatarUrl) {
      setAvatarUrl(storedAvatarUrl)
    }

    fetchCountryCode()
  }, [])

  useEffect(() => {
    // Save messages to local storage whenever the messages state changes
    localStorage.setItem('anonymousMessages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    // Save username to local storage whenever it changes
    localStorage.setItem('username', username)
  }, [username])

  useEffect(() => {
    // Save avatar URL to local storage whenever it changes
    localStorage.setItem('avatarUrl', avatarUrl)
  }, [avatarUrl])

  const fetchCountryCode = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      setCountryCode(data.country_code)
    } catch (error) {
      console.error('Error fetching country code:', error)
      setCountryCode('XX')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: Date.now(),
        username: username.trim() || 'Anonymous',
        avatarUrl: avatarUrl.trim(),
        countryCode: countryCode
      }
      setMessages(prevMessages => {
        const updatedMessages = [message, ...prevMessages]
        // Save the updated messages to local storage
        localStorage.setItem('anonymousMessages', JSON.stringify(updatedMessages))
        return updatedMessages
      })
      setNewMessage('')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-center">Anonymous Messaging</h1>
      <div className="mb-4 space-y-2">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name (optional)"
        />
        <Input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Avatar URL (optional)"
        />
      </div>
      <form onSubmit={handleSubmit} className="mb-4">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="mb-2"
        />
        <Button type="submit" className="w-full bg-slate-400 text-white">
          Send Message
        </Button>
      </form>

      <h2 className='font-semibold text-[20px]'>Messages</h2>
      <ScrollArea className="h-[400px] border rounded-md p-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet. Be the first to post!</p>
        ) : (
          messages.map((message) => (
           
           <div key={message.id} className="mb-4 p-3 bg-muted rounded-lg flex items-start space-x-3">
             
              <Avatar>
                <AvatarImage src={message.avatarUrl} alt={message.username} />
                <AvatarFallback>{getInitials(message.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
            
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{message.username || 'Anonymous'}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Globe className="w-3 h-3 mr-1" />
                    <span>{message.countryCode}</span>
                    {message.countryCode === 'TR' && <StarIcon className="ml-1 w-3 h-3"  />}
                  </div>
                </div>
                <p className="mb-1">{message.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}