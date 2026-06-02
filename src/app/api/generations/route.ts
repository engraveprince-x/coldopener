import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

  const generations = await prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 }
      : {}),
    select: {
      id: true,
      recipientName: true,
      recipientCompany: true,
      emailSubject: true,
      emailBody: true,
      createdAt: true,
    },
  });

  const hasMore = generations.length > limit;
  const items = hasMore ? generations.slice(0, limit) : generations;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json({
    generations: items,
    nextCursor,
  });
}
