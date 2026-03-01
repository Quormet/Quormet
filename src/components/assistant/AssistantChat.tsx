'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Bot, Lock } from 'lucide-react'
import Link from 'next/link'
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
    'Create a poll for members',
    'Who hasn\'t paid dues?',
]

export default function AssistantChat({ userRole, canUseAI }: { userRole: 'admin' | 'member', canUseAI: boolean }) {
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
        <div className="flex flex-col h-full bg-background/50">
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

            {/* Input or Paywall */}
            {!canUseAI ? (
                <div className="p-4 border-t bg-slate-50 flex flex-col items-center text-center space-y-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                        <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-sm">AI Assistant is a Pro feature</h4>
                    <p className="text-xs text-slate-500">
                        Upgrade to Member Pro for $3/month to unlock the AI assistant and more. Your board hasn't upgraded yet — you can unlock it for yourself.
                    </p>
                    <div className="flex gap-2 w-full pt-2">
                        <Button className="flex-1 text-xs h-8" asChild>
                            <Link href="/pricing">Upgrade for $3/mo</Link>
                        </Button>
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    )
}
