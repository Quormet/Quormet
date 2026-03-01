export function getTools(role: 'admin' | 'member') {
    const memberTools = [
        {
            name: 'search_documents',
            description: 'Search community documents, bylaws, and rules to answer a question',
            parameters: {
                type: 'OBJECT',
                properties: {
                    query: { type: 'STRING', description: 'The question or topic to search for' }
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
            description: 'Check the current user\'s dues payment status',
        },
    ];

    const adminTools = [
        {
            name: 'create_announcement',
            description: 'Post a new announcement to the community',
            parameters: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: 'Short title for the announcement' },
                    body: { type: 'STRING', description: 'Full announcement text' }
                },
                required: ['title', 'body']
            }
        },
        {
            name: 'create_poll',
            description: 'Create a new community poll for members to vote on',
            parameters: {
                type: 'OBJECT',
                properties: {
                    question: { type: 'STRING', description: 'The poll question' },
                    options: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                        description: 'List of 2-4 answer options',
                    },
                    endsAt: { type: 'STRING', description: 'Optional ISO date string for when the poll closes' }
                },
                required: ['question', 'options']
            }
        },
        {
            name: 'create_event',
            description: 'Schedule a new community event',
            parameters: {
                type: 'OBJECT',
                properties: {
                    name: { type: 'STRING', description: 'Event name' },
                    description: { type: 'STRING', description: 'Event description' },
                    location: { type: 'STRING', description: 'Where the event will be held' },
                    startsAt: { type: 'STRING', description: 'ISO date string for event start time' }
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
                type: 'OBJECT',
                properties: {
                    pollId: { type: 'STRING', description: 'The poll ID to check' }
                },
                required: ['pollId']
            }
        },
        {
            name: 'summarize_meeting_notes',
            description: 'Summarize raw meeting notes into structured minutes with action items',
            parameters: {
                type: 'OBJECT',
                properties: {
                    notes: { type: 'STRING', description: 'The raw meeting notes to summarize' }
                },
                required: ['notes']
            }
        },
    ];

    const declarations = role === 'admin' ? [...memberTools, ...adminTools] : memberTools;
    // Deep clone to ensure structure maps correctly to genai formats if needed
    return [{ functionDeclarations: declarations }];
}
