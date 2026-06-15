// src/lib/validations/task.ts — Zod v4 compatible

import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z
    .string({ error: "Title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(255, "Title cannot exceed 255 characters."),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters.")
    .optional(),

  // Zod v4: z.enum() no longer accepts errorMap — use `error` string
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const, {
    error: "Select a valid priority level.",
  }),

  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format.")
    .optional()
    .or(z.literal("")),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
