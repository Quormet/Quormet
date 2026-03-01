# Quormet — AI Community Assistant Spec
> Using Google Cloud Generative AI (`@google/genai`) with Vertex AI
> Model: `gemini-2.5-flash`

---

## Overview

The assistant is a persistent chat panel on the dashboard. It has two modes:

- **Ask** — answers questions using the community's documents, bylaws, schedules, and data
- **Act** — executes actions inside Quormet (create events, post announcements, create polls, etc.)

It knows who you are, what community you're in, your role (admin vs member), and the full state of your community. Members and admins both use it but get different capabilities.

---

## UI Layout

The assistant lives as a right-side panel on the dashboard (desktop) and a floating button that expands to full-screen on mobile.

```
┌─────────────────────────┬──────────────────────────┐
│                         │  🤖 Quormet Assistant     │
│   Dashboard content     ├──────────────────────────┤
│   (left 60%)            │                          │
│                         │   Hi Samuel! I can help  │
│                         │   you manage Maplewood   │
│                         │   HOA. Ask me anything   │
│                         │   or tell me what to do. │
│                         │                          │
│                         │   ┌──────────────────┐   │
│                         │   │ Are pets allowed  │   │
│                         │   │ in the pool?      │   │
│                         │   └──────────────────┘   │
│                         │                          │
│                         │   According to Section   │
│                         │   4.2 of your bylaws,    │
│                         │   pets are not permitted │
│                         │   in the pool area.      │
│                         │                          │
│                         │   ┌──────────────────┐   │
│                         │   │ Schedule a pool   │   │
│                         │   │ party March 15    │   │
│                         │   └──────────────────┘   │
│                         │                          │
│                         │   Done! Event created:   │
│                         │   ┌──────────────────┐   │
│                         │   │ 📅 Pool Party     │   │
│                         │   │ March 15 · 2:00PM │   │
│                         │   │ [View] [Edit]     │   │
│                         │   └──────────────────┘   │
│                         │                          │
├─────────────────────────┴──────────────────────────┤
│                         │ [Ask anything...   ] [→] │
└─────────────────────────┴──────────────────────────┘
```

### Suggested prompts (shown when chat is empty)
```
[📋 What are the quiet hours?]
[📅 Schedule an event]
[🗳️ Create a poll]
[💰 Who hasn't paid dues?]
```

---

## What the Assistant Can Do

### For All Members

| User says | Assistant does |
|-----------|---------------|
| "What are the quiet hours?" | Searches documents, returns answer with source |
| "Can I install a fence?" | Answers from bylaws |
| "When is the next meeting?" | Queries events table, returns date |
| "What polls are open?" | Lists active polls |
| "What events are coming up?" | Lists upcoming events |
| "Have I paid my dues?" | Returns their payment status |

### For Admins Only

| User says | Assistant does |
|-----------|---------------|
| "Post an announcement about the water shutoff tomorrow" | Creates announcement, confirms |
| "Create a poll: should we repaint the clubhouse? yes/no/maybe" | Creates poll, confirms |
| "Schedule a block party March 15 at 2pm at community park" | Creates event, confirms |
| "Who hasn't paid dues?" | Returns list of unpaid members |
| "Who hasn't voted on the clubhouse poll?" | Returns list of non-voters |
| "Close the clubhouse poll" | Closes poll, confirms |
| "Summarize these meeting notes: [paste]" | Returns structured summary + action items |

---

## Install

```bash
npm install @google/genai
```

Add to `.env.local`:
```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
# For local dev — path to your service account JSON key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

**Vertex AI setup:**
1. Go to Google Cloud Console → enable the **Vertex AI API**
2. Create a service account with the `Vertex AI User` role
3. Download the JSON key and set `GOOGLE_APPLICATION_CREDENTIALS`
4. On Vercel, paste the entire JSON key contents as an env var `GOOGLE_SERVICE_ACCOUNT_JSON` and load it in code (see API route below)

---

## File Structure

```
src/
  app/
    (dashboard)/
      dashboard/
        page.tsx                  ← add AssistantPanel here
    api/
      assistant/
        route.ts                  ← main API route
  components/
    assistant/
      AssistantPanel.tsx          ← outer panel layout
      AssistantChat.tsx           ← message list + input (client component)
      AssistantMessage.tsx        ← individual message bubble
      AssistantActionCard.tsx     ← rendered action result card
      SuggestedPrompts.tsx        ← empty state chips
  utils/
    assistant/
      gemini.ts                   ← Gemini client singleton
      tools.ts                    ← tool declarations
      executeTools.ts             ← maps tool calls to DB actions
      systemPrompt.ts             ← builds system prompt with community context
```

---

## Gemini Client

`src/utils/assistant/gemini.ts`

```ts
import { GoogleGenAI } from '@google/genai'

// For Vercel: load credentials from env var containing the full JSON key
function getClient() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT!,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1',
      googleAuthOptions: { credentials },
    })
  }

  // Local dev — uses GOOGLE_APPLICATION_CREDENTIALS file path automatically
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1',
  })
}

export const ai = getClient()
export const MODEL = 'gemini-2.5-flash'
```

---

## Tool Declarations

`src/utils/assistant/tools.ts`

Gemini uses `functionDeclarations` inside a `Tool` object. The schema format is OpenAPI-compatible JSON Schema.

```ts
import { FunctionDeclaration } from '@google/genai'

const memberFunctions: FunctionDeclaration[] = [
  {
    name: 'search_documents',
    description: 'Search community documents, bylaws, and rules to answer a question',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The question or topic to search for',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_events',
    description: 'Get a list of upcoming community events',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_polls',
    description: 'Get a list of active community polls',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_my_dues_status',
    description: "Check the current user's dues payment status",
    parameters: { type: 'object', properties: {} },
  },
]

const adminFunctions: FunctionDeclaration[] = [
  {
    name: 'create_announcement',
    description: 'Post a new announcement to the community',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title for the announcement' },
        body: { type: 'string', description: 'Full announcement text' },
      },
      required: ['title', 'body'],
    },
  },
  {
    name: 'create_poll',
    description: 'Create a new community poll for members to vote on',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The poll question' },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of 2-4 answer options',
        },
        endsAt: {
          type: 'string',
          description: 'Optional ISO date string for when the poll closes',
        },
      },
      required: ['question', 'options'],
    },
  },
  {
    name: 'create_event',
    description: 'Schedule a new community event',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Event name' },
        description: { type: 'string', description: 'Event description' },
        location: { type: 'string', description: 'Where the event will be held' },
        startsAt: {
          type: 'string',
          description: 'ISO date string for event start time',
        },
      },
      required: ['name', 'startsAt'],
    },
  },
  {
    name: 'get_unpaid_members',
    description: 'Get a list of members who have not paid dues',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_non_voters',
    description: 'Get members who have not voted on a specific poll',
    parameters: {
      type: 'object',
      properties: {
        pollId: { type: 'string', description: 'The poll ID to check' },
      },
      required: ['pollId'],
    },
  },
  {
    name: 'summarize_meeting_notes',
    description: 'Summarize raw meeting notes into structured minutes with action items',
    parameters: {
      type: 'object',
      properties: {
        notes: { type: 'string', description: 'The raw meeting notes to summarize' },
      },
      required: ['notes'],
    },
  },
]

export function getTools(role: 'admin' | 'member') {
  const functions = role === 'admin'
    ? [...memberFunctions, ...adminFunctions]
    : memberFunctions

  return [{ functionDeclarations: functions }]
}
```

---

## System Prompt

`src/utils/assistant/systemPrompt.ts`

```ts
import { format } from 'date-fns'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { db } from '@/db'
import { communities, events, polls, documents, users, payments } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function buildSystemPrompt(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  const [community, upcomingEvents, activePolls, docs, allMembers, paidMembers] =
    await Promise.all([
      db.query.communities.findFirst({ where: eq(communities.id, user!.communityId!) }),
      db.select().from(events).where(eq(events.communityId, user!.communityId!)),
      db.select().from(polls).where(eq(polls.communityId, user!.communityId!)),
      db.select().from(documents).where(eq(documents.communityId, user!.communityId!)),
      db.select().from(users).where(eq(users.communityId, user!.communityId!)),
      db.select().from(payments).where(eq(payments.communityId, user!.communityId!)),
    ])

  const memberCount = allMembers.length
  const paidCount = new Set(paidMembers.map(p => p.userId)).size

  return `
You are the AI assistant for ${community?.name}, a community management platform called Quormet.
Today is ${format(new Date(), 'MMMM d, yyyy')}.

## Who You're Talking To
Name: ${user!.name}
Role: ${user!.role} (${user!.role === 'admin' ? 'board member with full access' : 'resident'})
Community: ${community?.name}

## Current Community State
Members: ${memberCount} total residents
Dues: ${paidCount} of ${memberCount} paid for the current period
Join code: ${community?.joinCode}

## Active Polls (${activePolls.length})
${activePolls.map(p => `- "${p.question}"`).join('\n') || 'None'}

## Upcoming Events (${upcomingEvents.length})
${upcomingEvents.map(e => `- ${e.name} on ${format(new Date(e.startsAt), 'MMM d')} at ${format(new Date(e.startsAt), 'h:mm a')} ${e.location ? `at ${e.location}` : ''}`).join('\n') || 'None scheduled'}

## Community Documents
${docs.map(d => `- ${d.name} (${d.category})`).join('\n') || 'No documents uploaded yet'}

## Your Capabilities
${user!.role === 'admin' ? `
As an admin assistant you can:
- Answer questions about community rules, schedules, and data
- Create announcements, polls, and events on behalf of the admin
- Look up payment status for any member
- Summarize meeting notes and extract action items
` : `
As a member assistant you can:
- Answer questions about community rules, bylaws, and schedules
- Tell the member about upcoming events and active polls
- Check the member's own dues status
You CANNOT create content or take admin actions.
`}

## Tone
- Be concise — this is a chat interface, not an essay
- When you take an action, confirm clearly what you did
- When answering from documents, cite the source
- If you don't know something, say so — never make up rules or policies
`
}
```

---

## API Route

`src/app/api/assistant/route.ts`

This is the agentic loop. Gemini returns a `functionCall`, your code executes it, you pass the result back as a `functionResponse`, and Gemini generates the final reply.

```ts
import { NextResponse } from 'next/server'
import { ai, MODEL } from '@/utils/assistant/gemini'
import { getTools } from '@/utils/assistant/tools'
import { executeTool } from '@/utils/assistant/executeTools'
import { buildSystemPrompt } from '@/utils/assistant/systemPrompt'
import { getCurrentUser } from '@/utils/getCurrentUser'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!user.communityId) return new Response('No community', { status: 400 })

  const { messages } = await request.json()

  const systemPrompt = await buildSystemPrompt(user)
  const tools = getTools(user.role as 'admin' | 'member')

  // Convert frontend message history to Gemini content format
  // Gemini uses 'model' instead of 'assistant' for role
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  let toolResult: { type: string; data: any } | null = null

  // Agentic loop — keeps going until Gemini stops calling functions
  while (true) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools,
        maxOutputTokens: 1024,
        temperature: 0.3,
      },
    })

    const candidate = response.candidates?.[0]
    if (!candidate) break

    const parts = candidate.content?.parts ?? []
    const functionCallPart = parts.find(p => p.functionCall)

    // No function call — Gemini is done, return final text response
    if (!functionCallPart?.functionCall) {
      const text = parts.map(p => p.text ?? '').join('')
      return NextResponse.json({ message: text, toolResult })
    }

    // Execute the function call
    const { name, args } = functionCallPart.functionCall
    const result = await executeTool(name!, args as Record<string, any>, user)
    toolResult = result

    // Add the function call + response to the conversation and loop
    contents.push({
      role: 'model',
      parts: [{ functionCall: { name, args } }],
    })
    contents.push({
      role: 'user',
      parts: [{
        functionResponse: {
          name: name!,
          response: { output: JSON.stringify(result.data) },
        },
      }],
    })
  }

  return NextResponse.json({ message: 'Something went wrong.', toolResult: null })
}
```

---

## Tool Execution

`src/utils/assistant/executeTools.ts`

```ts
import { db } from '@/db'
import { announcements, polls, events, users, documents, payments } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/utils/getCurrentUser'

type User = Awaited<ReturnType<typeof getCurrentUser>>

export async function executeTool(
  toolName: string,
  input: Record<string, any>,
  user: User
): Promise<{ success: boolean; type: string; data: any }> {

  switch (toolName) {

    case 'search_documents': {
      const docs = await db.select().from(documents)
        .where(eq(documents.communityId, user!.communityId!))
      const query = (input.query as string).toLowerCase()
      const relevant = docs.filter(d =>
        d.name.toLowerCase().includes(query) ||
        (d.description ?? '').toLowerCase().includes(query)
      )
      return { success: true, type: 'documents', data: relevant }
    }

    case 'get_events': {
      const upcoming = await db.select().from(events)
        .where(eq(events.communityId, user!.communityId!))
      return { success: true, type: 'event_list', data: upcoming }
    }

    case 'get_polls': {
      const active = await db.select().from(polls)
        .where(eq(polls.communityId, user!.communityId!))
      return { success: true, type: 'poll_list', data: active }
    }

    case 'get_my_dues_status': {
      const userPayments = await db.select().from(payments)
        .where(and(
          eq(payments.userId, user!.id),
          eq(payments.communityId, user!.communityId!)
        ))
      return {
        success: true,
        type: 'dues_status',
        data: { paid: userPayments.length > 0, payments: userPayments }
      }
    }

    case 'create_announcement': {
      const [created] = await db.insert(announcements).values({
        communityId: user!.communityId!,
        authorId: user!.id,
        title: input.title,
        body: input.body,
      }).returning()
      return { success: true, type: 'announcement', data: created }
    }

    case 'create_poll': {
      const [created] = await db.insert(polls).values({
        communityId: user!.communityId!,
        authorId: user!.id,
        question: input.question,
        options: input.options,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      }).returning()
      return { success: true, type: 'poll', data: created }
    }

    case 'create_event': {
      const [created] = await db.insert(events).values({
        communityId: user!.communityId!,
        name: input.name,
        description: input.description ?? '',
        location: input.location ?? '',
        startsAt: new Date(input.startsAt),
      }).returning()
      return { success: true, type: 'event', data: created }
    }

    case 'get_unpaid_members': {
      const allMembers = await db.select().from(users)
        .where(eq(users.communityId, user!.communityId!))
      const paidIds = new Set(
        (await db.select().from(payments)
          .where(eq(payments.communityId, user!.communityId!)))
          .map(p => p.userId)
      )
      const unpaid = allMembers.filter(m => !paidIds.has(m.id))
      return { success: true, type: 'member_list', data: unpaid }
    }

    case 'get_non_voters': {
      const allMembers = await db.select().from(users)
        .where(eq(users.communityId, user!.communityId!))
      // Import votes table from your schema
      // const votedIds = new Set(votes where pollId = input.pollId)
      // const nonVoters = allMembers.filter(m => !votedIds.has(m.id))
      return { success: true, type: 'member_list', data: allMembers }
    }

    case 'summarize_meeting_notes': {
      // For this tool, just pass the notes back in the response
      // Gemini will summarize them in its final reply — no DB action needed
      return {
        success: true,
        type: 'meeting_notes',
        data: { notes: input.notes, instruction: 'Summarize these notes into structured minutes with action items and suggested polls.' }
      }
    }

    default:
      return { success: false, type: 'error', data: { message: `Unknown tool: ${toolName}` } }
  }
}
```

---

## Chat UI Component

`src/components/assistant/AssistantChat.tsx`

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Bot } from 'lucide-react'
import AssistantMessage from './AssistantMessage'
import AssistantActionCard from './AssistantActionCard'
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
  "Who hasn't paid dues?",
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
            content: m.content,
          })),
        }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        toolResult: data.toolResult,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
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
              <div key={i}>
                <AssistantMessage message={msg} />
                {msg.toolResult && (
                  <AssistantActionCard
                    type={msg.toolResult.type}
                    data={msg.toolResult.data}
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
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
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </Button>
      </div>
    </div>
  )
}
```

---

## Action Cards

`src/components/assistant/AssistantActionCard.tsx`

Renders a confirmation card when Gemini creates something — not just plain text.

```tsx
import { Calendar, Megaphone, BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AssistantActionCard({ type, data }: { type: string; data: any }) {
  if (type === 'announcement') return (
    <Card className="p-3 mt-2 border-l-4 border-l-blue-500">
      <div className="flex items-center gap-2 mb-1">
        <Megaphone className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium text-blue-500">Announcement Posted</span>
      </div>
      <p className="font-semibold text-sm">{data.title}</p>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.body}</p>
      <Link href="/announcements">
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View →</Button>
      </Link>
    </Card>
  )

  if (type === 'event') return (
    <Card className="p-3 mt-2 border-l-4 border-l-green-500">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-green-500" />
        <span className="text-xs font-medium text-green-500">Event Created</span>
      </div>
      <p className="font-semibold text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        {format(new Date(data.startsAt), 'MMM d · h:mm a')}
        {data.location && ` · ${data.location}`}
      </p>
      <Link href="/events">
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View →</Button>
      </Link>
    </Card>
  )

  if (type === 'poll') return (
    <Card className="p-3 mt-2 border-l-4 border-l-purple-500">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-medium text-purple-500">Poll Created</span>
      </div>
      <p className="font-semibold text-sm">{data.question}</p>
      <p className="text-xs text-muted-foreground">{data.options?.length} options</p>
      <Link href="/polls">
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View →</Button>
      </Link>
    </Card>
  )

  return null
}
```

---

## Key Differences from Anthropic SDK

If you've seen examples using `@anthropic-ai/sdk`, here's what changes with Gemini:

| Concept | Anthropic | Gemini (`@google/genai`) |
|---------|-----------|--------------------------|
| Role name | `assistant` | `model` |
| Tool format | `tools: [{ name, description, input_schema }]` | `tools: [{ functionDeclarations: [...] }]` |
| Tool call in response | `content[].type === 'tool_use'` | `parts[].functionCall` |
| Tool result back to model | `{ role: 'user', content: [{ type: 'tool_result' }] }` | `{ role: 'user', parts: [{ functionResponse }] }` |
| Stop reason | `stop_reason === 'tool_use'` | Check if any part has `functionCall` |
| System prompt | `system: '...'` top-level param | `config.systemInstruction: '...'` |
| Model name | `claude-sonnet-4-20250514` | `gemini-2.5-flash` |

---

## ✅ Done When

- [ ] `npm install @google/genai` added and Vertex AI env vars configured
- [ ] Chat panel renders on dashboard with suggested prompts
- [ ] Member can ask "what are the quiet hours?" and get an answer
- [ ] Admin can say "post an announcement about the water shutoff" and it appears in announcements
- [ ] Admin can say "create a poll: should we get a security camera? yes/no" and poll is created
- [ ] Admin can say "schedule a block party March 15 at 2pm" and event is created
- [ ] Action cards render after successful tool calls with links to the created item
- [ ] Member cannot trigger admin tools — enforced server-side by `getTools(user.role)`
- [ ] Works on mobile as a full-screen overlay