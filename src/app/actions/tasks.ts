// src/app/actions/tasks.ts
//
// "use server" marks this entire module as a Server Action boundary.
// The Next.js bundler enforces that NOTHING from this file ships to the client bundle.
// The browser only ever receives an opaque POST-able function reference.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema, type TaskCreateInput } from "@/lib/validations/task";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@prisma/client";

// ─── Strict Return Type ────────────────────────────────────────────────────────
// Using a discriminated union forces the caller (client component) to
// exhaustively handle both success and failure branches at compile time.

type ActionSuccess = {
  status: "success";
  taskId: string;
};

type ActionError = {
  status: "error";
  message: string;
  // fieldErrors mirrors zod's ZodError.flatten().fieldErrors shape,
  // keyed by field name → array of error strings
  fieldErrors?: Partial<Record<keyof TaskCreateInput, string[]>>;
};

export type CreateTaskActionResult = ActionSuccess | ActionError;

// ─── Server Action ─────────────────────────────────────────────────────────────

export async function createTaskAction(
  // prevState: required by useActionState — represents the previous return value.
  // Type it as the action's return type OR null (initial state before first call).
  _prevState: CreateTaskActionResult | null,
  formData: FormData
): Promise<CreateTaskActionResult> {
  // ① Authentication Guard — always the FIRST check in any sensitive action.
  //    Never trust middleware alone; a misconfigured matcher could bypass it.
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized. Please sign in." };
  }

  // ② Parse & Validate — extract raw FormData into a typed object for Zod
  const rawInput = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  };

  const parsed = taskCreateSchema.safeParse(rawInput);

  if (!parsed.success) {
    // Return field-level errors so the form can show inline messages
    // without a page reload or client-side re-validation.
    return {
      status: "error",
      message: "Validation failed. Please check your input.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // ③ Database Write — scoped to the authenticated user's ID.
  //    We NEVER let the client provide the userId — it comes from the trusted server session.
  try {
    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        priority: parsed.data.priority as Priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: TaskStatus.PENDING,
        userId: session.user.id, // ← Authoritative user binding from server session
      },
      select: { id: true }, // Minimal projection — don't pull back the full row
    });

    // ④ Cache Invalidation — tell Next.js to revalidate the tasks list page.
    //    Without this, the RSC cache would serve stale data after the mutation.
    revalidatePath("/dashboard/tasks");

    return { status: "success", taskId: task.id };
  } catch (error) {
    // Log server-side for observability, but return a safe generic message
    console.error("[createTaskAction] DB write failed:", error);
    return { status: "error", message: "An unexpected error occurred. Please try again." };
  }
}
