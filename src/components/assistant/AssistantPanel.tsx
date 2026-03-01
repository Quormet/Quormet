'use client'

import { useState } from 'react'
import { Bot, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AssistantChat from './AssistantChat'

export default function AssistantPanel({ userRole }: { userRole: 'admin' | 'member' }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Desktop Panel */}
            <div className="hidden lg:flex flex-col w-[400px] shrink-0 border-l bg-card h-full">
                <AssistantChat userRole={userRole} />
            </div>

            {/* Mobile Floating Button & Overlay */}
            <div className="lg:hidden">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                    size="icon"
                >
                    <Bot className="w-6 h-6" />
                </Button>

                {isOpen && (
                    <div className="fixed inset-0 z-50 bg-background flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <span className="font-semibold">Quormet Assistant</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <AssistantChat userRole={userRole} />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
