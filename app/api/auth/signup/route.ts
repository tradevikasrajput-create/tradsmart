import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser(email, hash);

    const token = await signToken({ id: newUser.id, role: newUser.role });

    return NextResponse.json({ 
      message: 'Signup successful', 
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, plan: newUser.plan }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
