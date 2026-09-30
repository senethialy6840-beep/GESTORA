import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function verifyMobileAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Non autorisé. Jeton manquant.' };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user) {
      return { error: 'Utilisateur introuvable.' };
    }

    return { user };
  } catch (err) {
    return { error: 'Jeton invalide ou expiré.' };
  }
}
