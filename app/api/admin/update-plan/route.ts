import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function isAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-')) return false;
  const userId = authHeader.replace('Bearer mock-jwt-', '');
  const user = db.users.find(u => u.id === userId);
  return user?.role === 'admin';
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, plan, isBanned } = body;

    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (plan) targetUser.plan = plan;
    if (typeof isBanned === 'boolean') targetUser.isBanned = isBanned;

    return NextResponse.json({ success: true, user: targetUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
