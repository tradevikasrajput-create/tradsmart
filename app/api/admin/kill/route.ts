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
    const { killSwitch } = body;

    if (typeof killSwitch === 'boolean') {
      db.system.killSwitch = killSwitch;
      return NextResponse.json({ success: true, killSwitch: db.system.killSwitch });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
