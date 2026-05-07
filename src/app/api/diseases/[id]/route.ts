import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const result = await query(
            'DELETE FROM chronic_diseases WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, session.user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Disease not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status, description, severity } = await req.json();

        const result = await query(
            `UPDATE chronic_diseases 
             SET status = COALESCE($1, status), 
                 description = COALESCE($2, description),
                 severity = COALESCE($3, severity),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5 RETURNING *`,
            [status, description, severity, id, session.user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Disease not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
