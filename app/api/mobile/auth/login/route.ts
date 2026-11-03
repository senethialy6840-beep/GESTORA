import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailTrimmed },
      include: { company: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    let currentStatus = user.company?.subscriptionStatus || "ACTIVE";
    if (user.company?.subscriptionExpiresAt) {
      const expiresAt = new Date(user.company.subscriptionExpiresAt);
      if (new Date() > expiresAt && currentStatus === "ACTIVE") {
        currentStatus = "EXPIRED";
        await prisma.company.update({
          where: { id: user.companyId },
          data: { subscriptionStatus: "EXPIRED", isActive: false }
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
      },
      process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        company: user.company ? {
          id: user.company.id,
          name: user.company.name,
          subscriptionStatus: currentStatus,
          plan: user.company.plan
        } : null
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
