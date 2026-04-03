import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-for-dev');

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch (e) {
    return null;
  }
}
