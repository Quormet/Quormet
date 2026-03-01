/* eslint-disable @typescript-eslint/no-explicit-any */
// We cast to `any` here because the @google/genai schema types use complex
// recursive Record<string, Schema> types that TypeScript struggles with for
// inline literal objects. The runtime shape is correct.
export function getTools(role: 'admin' | 'member'): any[] {
    const memberTools = [
        {
            name: 'search_documents',
            description: 'Search community documents, bylaws, and rules to answer a question',
            parameters: {
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
        },
        {
            name: 'get_polls',
            description: 'Get active community polls',
        },
        {
            name: 'get_my_dues_status',
            description: "Check the current user's dues payment status",
        },
    ];

    const adminTools = [
        {
            name: 'create_announcement',
            description: 'Post a new announcement to the community',
            parameters: {
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
            parameters: {
                type: 'object',
                properties: {
                    question: { type: 'string', description: 'The poll question' },
                    options: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of 2-4 answer options',
                    },
                    endsAt: { type: 'string', description: 'Optional ISO date string for when the poll closes' }
                },
                required: ['question', 'options']
            }
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
                    startsAt: { type: 'string', description: 'ISO date string for event start time' }
                },
                required: ['name', 'startsAt']
            }
        },
        {
            name: 'get_unpaid_members',
            description: 'Get a list of members who have not paid dues',
        },
        {
            name: 'get_non_voters',
            description: 'Get members who have not voted on a specific poll',
            parameters: {
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
            parameters: {
                type: 'object',
                properties: {
                    notes: { type: 'string', description: 'The raw meeting notes to summarize' }
                },
                required: ['notes']
            }
        },
    ];

    const declarations = role === 'admin' ? [...memberTools, ...adminTools] : memberTools;
    return [{ functionDeclarations: declarations }];
}
