import { NextResponse } from 'next/server';
import { verifyMobileAuth } from '@/lib/mobileAuth';

export async function GET(request: Request) {
  const authResult = await verifyMobileAuth(request);
  if (authResult.error || !authResult.user) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  const { user } = authResult;

  let currentStatus = user.company?.subscriptionStatus || "ACTIVE";
  if (user.company?.subscriptionExpiresAt) {
    const expiresAt = new Date(user.company.subscriptionExpiresAt);
    if (new Date() > expiresAt && currentStatus === "ACTIVE") {
      currentStatus = "EXPIRED";
    }
  }

  return NextResponse.json({
    success: true,
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
}
