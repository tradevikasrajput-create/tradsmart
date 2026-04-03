import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      passwordHash: password, // In a real app, use bcrypt
      role: 'user' as const,
      plan: 'free' as const,
      isBanned: false,
    };

    db.users.push(newUser);

    // Mock JWT token
    const token = `mock-jwt-${newUser.id}`;

    return NextResponse.json({ 
      message: 'Signup successful', 
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, plan: newUser.plan }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
