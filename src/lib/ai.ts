import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

interface AnalysisResult {
    summary: string;
    sleep_quality?: number;
    anomalies?: string;
    recommendations?: string;
}

export async function analyzeSession(readings: unknown[]): Promise<AnalysisResult> {
    const prompt = `
    Analyze the following biometric data from a health monitoring session and provide:
    1. A brief summary of the session.
    2. Sleep quality assessment (if applicable, scale 1-100).
    3. Any detected anomalies.
    4. Health and lifestyle recommendations.

    Data (JSON):
    ${JSON.stringify(readings.slice(-100))}

    Return the response in JSON format with fields: summary, sleep_quality, anomalies, recommendations.
  `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'You are a healthcare data analyst. Response must be strictly valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
    });

    const text = chatCompletion.choices[0]?.message?.content || '{}';

    try {
        return JSON.parse(text);
    } catch (e) {
        return { summary: text };
    }
}

export async function chatWithAI(message: string, context: unknown) {
    const prompt = `
    You are evax AI, a helpful health monitoring assistant powered by Groq. 
    Use the following real-time biometric context to answer the user's question.
    Context: ${JSON.stringify(context)}
    User: ${message}
  `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'You are evax AI. Be concise and professional. Use markdown for formatting.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        model: 'llama-3.3-70b-versatile',
    });

    return chatCompletion.choices[0]?.message?.content || 'Telemetry link unstable.';
}
