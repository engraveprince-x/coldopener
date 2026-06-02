import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount, totalCount, subscription] = await Promise.all([
    prisma.usageLog.count({
      where: {
        userId,
        action: "generate",
        createdAt: { gte: today },
      },
    }),
    prisma.usageLog.count({
      where: { userId, action: "generate" },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, trialEndsAt: true },
    }),
  ]);

  return NextResponse.json({
    today: todayCount,
    total: totalCount,
    dailyLimit: 50,
    subscription,
  });
}
