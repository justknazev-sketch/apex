import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'apex_force_secure_jwt_secret_2026!';

export interface DecodedToken {
  userId: number;
  username: string;
  iat: number;
  exp: number;
}

export function signToken(payload: { userId: number; username: string }): string {
  // Token expires in 24 hours
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export async function getAdminSession(): Promise<DecodedToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
