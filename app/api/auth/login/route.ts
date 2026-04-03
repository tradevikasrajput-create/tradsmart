import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = db.users.find(u => u.email === email && u.passwordHash === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
    }

    // Mock JWT token
    const token = `mock-jwt-${user.id}`;

    return NextResponse.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, email: user.email, role: user.role, plan: user.plan }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
