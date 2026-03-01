'use client'

export default function SuggestedPrompts({
    prompts,
    onSelect
}: {
    prompts: string[];
    onSelect: (prompt: string) => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg tracking-tight">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground w-64 mx-auto">
                    I can answer questions using community documents or help you manage tasks.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {prompts.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(prompt)}
                        className="text-xs bg-muted hover:bg-muted/80 px-3 py-2 rounded-full transition-colors font-medium"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    )
}
