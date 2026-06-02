import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateColdEmail } from "@/lib/openai";
import { generateRateLimit, generateDailyLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // 2. Subscription check
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 403 },
      );
    }

    const validStatuses = ["trialing", "active"];
    if (!validStatuses.includes(subscription.status)) {
      if (subscription.status === "past_due") {
        return NextResponse.json(
          { error: "Payment past due. Please update your billing details." },
          { status: 402 },
        );
      }
      return NextResponse.json(
        { error: "Subscription inactive" },
        { status: 403 },
      );
    }

    // 3. Rate limit check
    const { success: minuteOk } = await generateRateLimit.limit(userId);
    if (!minuteOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded. 3 requests per minute allowed." },
        { status: 429 },
      );
    }

    const { success: dailyOk } = await generateDailyLimit.limit(userId);
    if (!dailyOk) {
      return NextResponse.json(
        { error: "Daily limit reached. 50 emails per day." },
        { status: 429 },
      );
    }

    // 4. Parse input
    const { description } = await req.json();
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Prospect description is required" },
        { status: 400 },
      );
    }

    // 5. Generate email
    const email = await generateColdEmail(description);

    // 6. Store generation
    const generation = await prisma.generation.create({
      data: {
        userId,
        linkedinUrl: description,
        recipientName: email.recipientName,
        recipientCompany: email.recipientCompany,
        emailSubject: email.subject,
        emailBody: email.body,
      },
    });

    // 7. Log usage
    await prisma.usageLog.create({
      data: { userId, action: "generate" },
    });

    return NextResponse.json({
      id: generation.id,
      subject: email.subject,
      body: email.body,
      recipientName: email.recipientName,
      recipientCompany: email.recipientCompany,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate email. Please try again." },
      { status: 500 },
    );
  }
}
