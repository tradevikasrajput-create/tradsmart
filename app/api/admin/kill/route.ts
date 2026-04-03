import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function isAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { killSwitch } = body;
    if (typeof killSwitch === 'boolean') {
      await db.setKillSwitch(killSwitch);
      return NextResponse.json({ success: true, killSwitch });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
