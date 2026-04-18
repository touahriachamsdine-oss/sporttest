import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { analyzeSession, chatWithAI as chatWithGemini } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const { type, sessionId, message, context } = await req.json();

        if (type === 'chat') {
            const reply = await chatWithGemini(message, context);
            return NextResponse.json({ reply });
        }

        if (type === 'analyze') {
            const readings = await query(
                'SELECT * FROM readings WHERE session_id = $1 ORDER BY recorded_at ASC',
                [sessionId]
            );

            const analysis = await analyzeSession(readings.rows);

            const insertResult = await query(
                `INSERT INTO insights (session_id, summary, sleep_quality, anomalies, recommendations)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [sessionId, analysis.summary, analysis.sleep_quality?.toString() || 'N/A', analysis.anomalies || 'None', analysis.recommendations || 'Keep monitoring.']
            );

            return NextResponse.json(insertResult.rows[0]);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        console.error('Insights error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
        }

        const insight = await query(
            'SELECT * FROM insights WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
            [sessionId]
        );

        return NextResponse.json(insight.rows[0] || null);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
