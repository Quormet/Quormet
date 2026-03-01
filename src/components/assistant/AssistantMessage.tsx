import { Bot, User } from 'lucide-react'
import AssistantActionCard from './AssistantActionCard'

type Message = {
    role: 'user' | 'assistant'
    content: string
    toolResult?: { type: string; data: any }
}

export default function AssistantMessage({ message }: { message: Message }) {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={`flex gap-3 mb-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAssistant ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`flex flex-col max-w-[80%] ${isAssistant ? '' : 'items-end'}`}>
                {message.content && (
                    <div className={`px-4 py-2 rounded-2xl ${isAssistant
                            ? 'bg-muted/50 rounded-tl-none text-sm'
                            : 'bg-primary text-primary-foreground rounded-tr-none text-sm'
                        }`}>
                        {message.content}
                    </div>
                )}

                {message.toolResult && (
                    <div className="mt-2 w-full max-w-sm">
                        <AssistantActionCard
                            type={message.toolResult.type}
                            data={message.toolResult.data}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
