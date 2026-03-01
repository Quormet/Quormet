# Quormet — AI Community Assistant Spec

> The AI assistant is the centerpiece feature of Quormet. It lives on the dashboard
> and lets any resident or admin interact with their entire community through natural
> language — asking questions, taking actions, and getting instant answers.

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
│                         ├──────────────────────────┤
│                         │ [Ask anything...   ] [→] │
└─────────────────────────┴──────────────────────────┘
```

### Suggested prompts (shown when chat is empty)
Show 4 clickable chip buttons so users know what it can do:

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
| "Who lives at unit 4?" | Queries directory (opted-in members only) |
| "What polls are open?" | Lists active polls |
| "What events are coming up?" | Lists upcoming events |
| "Have I paid my dues?" | Returns their payment status |

### For Admins Only

| User says | Assistant does |
|-----------|---------------|
| "Post an announcement about the water shutoff tomorrow at 9am" | Creates announcement, confirms |
| "Create a poll: should we repaint the clubhouse? Options: yes, no, maybe" | Creates poll, confirms |
| "Schedule a block party on March 15 at 2pm at the community park" | Creates event, confirms |
| "Who hasn't paid dues?" | Returns list of unpaid members |
| "Who hasn't voted on the clubhouse poll?" | Returns list of non-voters |
| "Close the clubhouse poll" | Closes poll, confirms |
| "How many members do we have?" | Returns member count |
| "Summarize these meeting notes: [paste]" | Returns formatted summary + suggested action items |

---

## Technical Architecture

### File Structure
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
      AssistantPanel.tsx          ← outer panel, layout
      AssistantChat.tsx           ← message list + input (client component)
      AssistantMessage.tsx        ← individual message bubble
      AssistantActionCard.tsx     ← rendered action result (event/poll/etc)
      SuggestedPrompts.tsx        ← empty state chips
  utils/
    assistant/
      tools.ts                    ← tool definitions for Gemini
      executeTools.ts             ← maps tool calls to server actions
      systemPrompt.ts             ← builds the system prompt with community context
```

---

## API Route

`src/app/api/assistant/route.ts`

This is the core of the feature. It:
1. Gets the current user + community context
2. Builds the system prompt
3. Calls the Anthropic API with tool definitions
4. If Claude uses a tool, executes it and loops back
5. Returns the final response

```ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { buildSystemPrompt } from '@/utils/assistant/systemPrompt'
import { getTools } from '@/utils/assistant/tools'
import { executeTool } from '@/utils/assistant/executeTools'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await request.json()

  const systemPrompt = await buildSystemPrompt(user)
  const tools = getTools(user.role)

  // Agentic loop — keeps going until Claude stops using tools
  let currentMessages = messages
  
  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: currentMessages,
    })

    // If Gemini is done, return the text response
    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('')
      return Response.json({ message: text, toolResults: [] })
    }

    // If Gemini wants to use tools, execute them
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = []

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input, user)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
          // Pass back the structured result so UI can render action cards
          _meta: result,
        })
      }

      // Add assistant response + tool results to message history and loop
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ]
    }
  }
}
```

---

## System Prompt

`src/utils/assistant/systemPrompt.ts`

The system prompt is built dynamically with real community data so Gemini always has context.

```ts
export async function buildSystemPrompt(user: User): Promise<string> {
  const [community, events, polls, documents, memberCount, paymentStats] = await Promise.all([
    getCommunity(user.communityId),
    getUpcomingEvents(user.communityId),
    getActivePolls(user.communityId),
    getDocuments(user.communityId),
    getMemberCount(user.communityId),
    getPaymentStats(user.communityId),
  ])

  return `
You are the AI assistant for ${community.name}, a community management platform called Quormet.

## Who You're Talking To
- Name: ${user.name}
- Role: ${user.role} (${user.role === 'admin' ? 'board member with full access' : 'resident with standard access'})
- Community: ${community.name}

## Current Community State
- Members: ${memberCount} total residents
- Dues: ${paymentStats.paid} of ${memberCount} paid for the current period
- Join code: ${community.joinCode}

## Active Polls (${polls.length})
${polls.map(p => `- "${p.question}" — ${p.totalVotes} votes so far`).join('\n') || 'None'}

## Upcoming Events (${events.length})
${events.map(e => `- ${e.name} on ${format(e.startsAt, 'MMM d')} at ${format(e.startsAt, 'h:mm a')}`).join('\n') || 'None scheduled'}

## Community Documents
${documents.map(d => `- ${d.name} (${d.category}): ${d.url}`).join('\n') || 'No documents uploaded yet'}

## Your Capabilities
${user.role === 'admin' ? `
As an admin assistant, you can:
- Answer questions about community rules, schedules, and data
- Create announcements, polls, and events on behalf of the admin
- Look up payment status for any member
- Close polls and manage community settings
- Summarize meeting notes and extract action items
` : `
As a member assistant, you can:
- Answer questions about community rules and bylaws
- Tell the member about upcoming events and active polls
- Check the member's own dues payment status
- Help members understand community policies
You CANNOT create content or take admin actions on behalf of members.
`}

## Tone & Style
- Be concise and helpful
- When you take an action, confirm what you did clearly
- When answering from documents, cite the source (e.g. "According to Section 4.2 of your bylaws...")
- If you don't know something, say so — don't make up rules or policies
- Keep responses short — this is a chat interface, not an essay
`
}
```

---

## Tool Definitions

`src/utils/assistant/tools.ts`

```ts
export function getTools(role: 'admin' | 'member') {
  const memberTools = [
    {
      name: 'search_documents',
      description: 'Search community documents, bylaws, and rules to answer a question',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The question or topic to search for' }
        },
        required: ['query']
      }
    },
    {
      name: 'get_events',
      description: 'Get upcoming community events',
      input_schema: { type: 'object', properties: {} }
    },
    {
      name: 'get_polls',
      description: 'Get active community polls',
      input_schema: { type: 'object', properties: {} }
    },
    {
      name: 'get_my_dues_status',
      description: 'Check the current user\'s dues payment status',
      input_schema: { type: 'object', properties: {} }
    },
  ]

  const adminTools = [
    {
      name: 'create_announcement',
      description: 'Post a new announcement to the community',
      input_schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short title for the announcement' },
          body: { type: 'string', description: 'Full announcement text' }
        },
        required: ['title', 'body']
      }
    },
    {
      name: 'create_poll',
      description: 'Create a new community poll for members to vote on',
      input_schema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The poll question' },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of 2-4 answer options',
            minItems: 2,
            maxItems: 4
          },
          endsAt: { type: 'string', description: 'Optional ISO date string for when the poll closes' }
        },
        required: ['question', 'options']
      }
    },
    {
      name: 'create_event',
      description: 'Schedule a new community event',
      input_schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Event name' },
          description: { type: 'string', description: 'Event description' },
          location: { type: 'string', description: 'Where the event will be held' },
          startsAt: { type: 'string', description: 'ISO date string for event start time' }
        },
        required: ['name', 'startsAt']
      }
    },
    {
      name: 'get_unpaid_members',
      description: 'Get a list of members who have not paid dues',
      input_schema: { type: 'object', properties: {} }
    },
    {
      name: 'get_non_voters',
      description: 'Get members who have not voted on a specific poll',
      input_schema: {
        type: 'object',
        properties: {
          pollId: { type: 'string', description: 'The poll ID to check' }
        },
        required: ['pollId']
      }
    },
    {
      name: 'summarize_meeting_notes',
      description: 'Summarize raw meeting notes into structured minutes with action items',
      input_schema: {
        type: 'object',
        properties: {
          notes: { type: 'string', description: 'The raw meeting notes to summarize' }
        },
        required: ['notes']
      }
    },
  ]

  return role === 'admin' ? [...memberTools, ...adminTools] : memberTools
}
```

---

## Tool Execution

`src/utils/assistant/executeTools.ts`

Maps every tool call to the corresponding existing server action or DB query.

```ts
import { db } from '@/db'
import { announcements, polls, events, users, payments } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function executeTool(
  toolName: string,
  input: Record<string, any>,
  user: User
): Promise<{ success: boolean; data: any; type: string }> {
  switch (toolName) {

    case 'search_documents': {
      // Simple text search across document names and descriptions
      // For V1 — search document titles and return URLs
      // For V2 — implement full RAG with embeddings
      const docs = await db.select().from(documents)
        .where(eq(documents.communityId, user.communityId))
      const relevant = docs.filter(d =>
        d.name.toLowerCase().includes(input.query.toLowerCase()) ||
        d.description?.toLowerCase().includes(input.query.toLowerCase())
      )
      return { success: true, type: 'documents', data: relevant }
    }

    case 'create_announcement': {
      const [created] = await db.insert(announcements).values({
        communityId: user.communityId,
        authorId: user.id,
        title: input.title,
        body: input.body,
      }).returning()
      return { success: true, type: 'announcement', data: created }
    }

    case 'create_poll': {
      const [created] = await db.insert(polls).values({
        communityId: user.communityId,
        authorId: user.id,
        question: input.question,
        options: input.options,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      }).returning()
      return { success: true, type: 'poll', data: created }
    }

    case 'create_event': {
      const [created] = await db.insert(events).values({
        communityId: user.communityId,
        name: input.name,
        description: input.description ?? '',
        location: input.location ?? '',
        startsAt: new Date(input.startsAt),
      }).returning()
      return { success: true, type: 'event', data: created }
    }

    case 'get_unpaid_members': {
      const allMembers = await db.select().from(users)
        .where(eq(users.communityId, user.communityId))
      const paidIds = new Set(
        (await db.select().from(payments)
          .where(eq(payments.communityId, user.communityId)))
          .map(p => p.userId)
      )
      const unpaid = allMembers.filter(m => !paidIds.has(m.id))
      return { success: true, type: 'member_list', data: unpaid }
    }

    case 'get_my_dues_status': {
      const payment = await db.select().from(payments)
        .where(and(
          eq(payments.userId, user.id),
          eq(payments.communityId, user.communityId)
        ))
      return { success: true, type: 'dues_status', data: { paid: payment.length > 0, payments: payment } }
    }

    case 'get_events': {
      const upcoming = await db.select().from(events)
        .where(eq(events.communityId, user.communityId))
      return { success: true, type: 'event_list', data: upcoming }
    }

    case 'get_polls': {
      const active = await db.select().from(polls)
        .where(eq(polls.communityId, user.communityId))
      return { success: true, type: 'poll_list', data: active }
    }

    default:
      return { success: false, type: 'error', data: { message: `Unknown tool: ${toolName}` } }
  }
}
```

---

## Frontend Component

`src/components/assistant/AssistantChat.tsx`

```tsx
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
    <div className="flex flex-col h-full">
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
            <div ref={bottomRef} />
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
```

---

## Action Cards

When the assistant creates something, it renders a confirmation card — not just text.

`src/components/assistant/AssistantActionCard.tsx`

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

## V1 vs V2 Scope

### V1 — Build for the Hackathon
- [x] Chat UI panel on dashboard
- [x] Anthropic API integration with tool calling
- [x] Tools: create_announcement, create_poll, create_event
- [x] Tools: get_events, get_polls, get_my_dues_status, get_unpaid_members
- [x] System prompt with community context
- [x] Action cards for created items
- [x] Suggested prompts on empty state
- [x] Admin vs member tool permissions
- [x] Document search by title/keyword (simple text match)

### V2 — After the Hackathon
- [ ] RAG (embeddings) on uploaded PDFs for accurate bylaw answers
- [ ] Streaming responses (feels much faster)
- [ ] Conversation history persisted in DB
- [ ] Push notifications triggered by AI ("Dues are due in 3 days")
- [ ] Voice input
- [ ] AI-generated meeting minutes from transcript

---

## Install

```bash
npm install @anthropic-ai/sdk
```

Add to `.env.local`:
```
ANTHROPIC_API_KEY=
```

---

## ✅ Done When

- [ ] Chat panel renders on dashboard with suggested prompts
- [ ] Member can ask "what are the quiet hours?" and get an answer from documents
- [ ] Admin can say "post an announcement about the water shutoff" and it appears in announcements
- [ ] Admin can say "create a poll: should we get a security camera? yes/no" and poll is created
- [ ] Admin can say "schedule a block party March 15 at 2pm" and event is created
- [ ] Action cards render after successful tool calls with links to the created item
- [ ] Member cannot use admin tools — permission is enforced server-side
- [ ] Works on mobile as a full-screen overlay