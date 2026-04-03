import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function isAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-')) return false;
  const userId = authHeader.replace('Bearer mock-jwt-', '');
  const user = db.users.find(u => u.id === userId);
  return user?.role === 'admin';
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({ users: db.users });
}
