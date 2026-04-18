import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const deviceId = searchParams.get('device_id');
        const days = parseInt(searchParams.get('days') || '7');

        if (!deviceId) {
            return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
        }

        const history = await query(
            `SELECT 
        DATE(recorded_at) as date,
        AVG(heart_rate) as avg_hr,
        AVG(spo2) as avg_spo2,
        AVG(sound_db) as avg_sound
       FROM readings 
       WHERE device_id = $1 
       AND recorded_at > CURRENT_DATE - INTERVAL '1 day' * $2
       GROUP BY DATE(recorded_at)
       ORDER BY date DESC`,
            [deviceId, days]
        );

        return NextResponse.json(history.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
