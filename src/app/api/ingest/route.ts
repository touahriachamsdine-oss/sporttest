import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { device_id, heart_rate, spo2, temperature, sound_db, red_raw, ir_raw } = data;

        if (!device_id) {
            return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
        }

        // Find active session
        let sessionResult = await query(
            'SELECT id FROM sessions WHERE device_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
            [device_id]
        );

        let sessionId;
        if (sessionResult.rows.length === 0) {
            // Auto-create session
            const newSession = await query(
                'INSERT INTO sessions (device_id, label) VALUES ($1, $2) RETURNING id',
                [device_id, 'auto-monitoring']
            );
            sessionId = newSession.rows[0].id;
        } else {
            sessionId = sessionResult.rows[0].id;
        }

        // Insert reading
        await query(
            `INSERT INTO readings (session_id, device_id, heart_rate, spo2, temperature, sound_db, red_raw, ir_raw)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [sessionId, device_id, heart_rate, spo2, temperature || 0, sound_db || 0, red_raw || 0, ir_raw || 0]
        );

        return NextResponse.json({ success: true, session_id: sessionId });
    } catch (error: any) {
        console.error('Ingest error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const deviceId = searchParams.get('device_id');
        const limit = parseInt(searchParams.get('limit') || '60');

        if (!deviceId) {
            return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
        }

        const readings = await query(
            `SELECT 
                id, 
                session_id, 
                device_id, 
                heart_rate::float, 
                spo2::float, 
                temperature::float, 
                sound_db::float, 
                red_raw::float, 
                ir_raw::float, 
                recorded_at 
            FROM readings 
            WHERE device_id = $1 
            ORDER BY recorded_at DESC 
            LIMIT $2`,
            [deviceId, limit]
        );

        return NextResponse.json(readings.rows.reverse());
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
