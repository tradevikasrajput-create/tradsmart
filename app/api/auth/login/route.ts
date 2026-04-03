import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await db.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
    }

    const token = await signToken({ id: user.id, role: user.role });

    return NextResponse.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, email: user.email, role: user.role, plan: user.plan }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
