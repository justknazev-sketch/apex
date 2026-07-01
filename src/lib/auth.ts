import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Критично: секрет должен быть задан через переменную окружения.
// Если JWT_SECRET не задан — сервер упадет при запуске, а не при входе в систему.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'Переменная окружения JWT_SECRET не задана! Добавьте её в .env файл или в настройки хостинга.'
  );
}

export interface DecodedToken {
  userId: number;
  username: string;
  iat: number;
  exp: number;
}

export function signToken(payload: { userId: number; username: string }): string {
  // Token expires in 24 hours
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '24h' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as DecodedToken;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<DecodedToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
