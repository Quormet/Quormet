'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Bot } from 'lucide-react'
import AssistantMessage from './AssistantMessage'
import SuggestedPrompts from './SuggestedPrompts'

type Message = {
    role: 'user' | 'assistant'
    content: string
    toolResult?: { type: string; data: any }
}

const SUGGESTED_PROMPTS = [
    'What are the quiet hours?',
    'Schedule a community event',
    'Create a poll for neighbors',
    'Who hasn\'t paid dues?',
]

export default function AssistantChat({ userRole }: { userRole: 'admin' | 'member' }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return

        const userMessage: Message = { role: 'user', content: text }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            const data = await res.json()
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                toolResult: data.toolResult
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Something went wrong. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                    <p className="font-semibold text-sm">Quormet Assistant</p>
                    <p className="text-xs text-muted-foreground">Ask anything about your community</p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                    <SuggestedPrompts
                        prompts={userRole === 'admin' ? SUGGESTED_PROMPTS : SUGGESTED_PROMPTS.slice(0, 2)}
                        onSelect={sendMessage}
                    />
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <AssistantMessage key={i} message={msg} />
                        ))}
                        {loading && (
                            <div className="flex gap-2 items-center text-muted-foreground text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Thinking...
                            </div>
                        )}
                        <div ref={bottomRef} className="h-1" />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Ask anything or give a command..."
                    disabled={loading}
                    className="flex-1"
                />
                <Button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    size="icon"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    )
}
