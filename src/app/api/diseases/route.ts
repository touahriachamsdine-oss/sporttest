import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const diseases = await query(
            'SELECT * FROM chronic_diseases WHERE user_id = $1 ORDER BY created_at DESC',
            [session.user.id]
        );

        return NextResponse.json(diseases.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, severity, status, diagnosed_at } = await req.json();
        
        const result = await query(
            `INSERT INTO chronic_diseases (user_id, name, description, severity, status, diagnosed_at) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [session.user.id, name, description, severity, status, diagnosed_at]
        );
        
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
