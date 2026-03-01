import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'AIzaSyAiYuIOOL8FsrUTP7vHLN2XS1GK__zpBkQ' });
async function run() {
    try {
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
            config: {
                tools: [{
                    functionDeclarations: [{
                        name: 'test',
                        description: 'test',
                        parameters: { type: 'object' as any, properties: { q: { type: 'string' as any } } }
                    }]
                }]
            }
        });
        console.log("SUCCESS");
    } catch (e) {
        console.log("ERROR:", (e as Error).message);
    }
}
run();
