// src/app/api/tasks/route.ts
//
// Route Handlers are Next.js's edge-compatible REST alternative.
// Use them when you need: a public-facing API consumed by mobile clients,
// webhooks, or third-party integrations — NOT for form submissions
// from your own UI (use Server Actions there instead).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Query Parameter Schema ────────────────────────────────────────────────────
const querySchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  // ① Auth check — identical pattern to the Server Action
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ② Parse & validate query params from the URL
  const { searchParams } = new URL(request.url);
  const queryParsed = querySchema.safeParse({
    status: searchParams.get("status"),
    priority: searchParams.get("priority"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  if (!queryParsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: queryParsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, priority, page, limit } = queryParsed.data;
  const skip = (page - 1) * limit;

  try {
    // ③ Scoped query — ALWAYS filter by userId. Never return other users' data.
    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where: {
          userId: session.user.id,
          ...(status && { status }),
          ...(priority && { priority }),
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          // Deliberately exclude: description (large text), userId (leaks internals)
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      // Count runs in the SAME transaction for consistency — avoids pagination race
      prisma.task.count({
        where: {
          userId: session.user.id,
          ...(status && { status }),
          ...(priority && { priority }),
        },
      }),
    ]);

    // ④ Uniform response envelope — consumers can always expect this shape
    return NextResponse.json({
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/tasks] Query failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
