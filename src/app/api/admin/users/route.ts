import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // Simple security check: Authentication gates removed per client request.

        const usersResult = await query('SELECT id, name, email, "createdAt" as created_at FROM public."user" ORDER BY "createdAt" DESC');

        // Enhance with session stats
        const users = await Promise.all(usersResult.rows.map(async (user: any) => {
            const sessionsCount = await query('SELECT count(*) FROM public.session WHERE "userId" = $1', [user.id]);
            return {
                ...user,
                sessions_count: parseInt(sessionsCount.rows[0].count),
            };
        }));

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
