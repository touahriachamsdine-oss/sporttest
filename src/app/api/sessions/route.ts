import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const sessions = await query('SELECT * FROM sessions ORDER BY started_at DESC');
        return NextResponse.json(sessions.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { device_id, label } = await req.json();
        const result = await query(
            'INSERT INTO sessions (device_id, label) VALUES ($1, $2) RETURNING *',
            [device_id, label]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id } = await req.json();
        const result = await query(
            'UPDATE sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
