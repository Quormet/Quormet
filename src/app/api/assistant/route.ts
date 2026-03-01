import { GoogleGenAI } from '@google/genai';
import { getCurrentUser } from '@/utils/getCurrentUser';
import { buildSystemPrompt } from '@/utils/assistant/systemPrompt';
import { getTools } from '@/utils/assistant/tools';
import { executeTool } from '@/utils/assistant/executeTools';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.gemini_api_key,
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { messages } = await request.json();

    const systemPrompt = await buildSystemPrompt(user);
    const tools = getTools(user.role as 'admin' | 'member');

    let contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools,
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const result = await executeTool(
        call.name ?? '',
        (call.args ?? {}) as Record<string, unknown>,
        user
      );

      contents.push({
        role: 'model',
        parts: response.functionCalls.map((c) => ({
          functionCall: { name: c.name, args: c.args },
        })),
      });
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: call.name,
              response: { result },
            },
          },
        ],
      });

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const text = finalResponse.text || 'Action completed.';

      return Response.json({ message: text, toolResult: result });
    }

    return Response.json({ message: response.text || '', toolResult: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Assistant Error:', msg);
    return new Response(
      JSON.stringify({ message: 'Error communicating with Assistant.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
