'use client'

import { useState } from 'react'
import { Bot, MessageSquare, X, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AssistantChat from './AssistantChat'
import { cn } from '@/lib/utils'

export default function AssistantPanel({ userRole, canUseAI }: { userRole: 'admin' | 'member'; canUseAI: boolean }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Expanded Chat Window */}
            {isOpen && (
                <div className={cn(
                    "mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-8rem)]",
                    "bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col",
                    "animate-in fade-in slide-in-from-bottom-4 duration-300"
                )}>
                    <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Quormet Assistant</p>
                                <p className="text-[10px] text-muted-foreground leading-none">Ask anything or give a command</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <Minus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <AssistantChat userRole={userRole} canUseAI={canUseAI} />
                    </div>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                    isOpen ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-primary text-primary-foreground"
                )}
                size="icon"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </Button>
        </div>
    )
}
