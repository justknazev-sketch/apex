import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        username: session.username,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Session check failed' }, { status: 500 });
  }
}
