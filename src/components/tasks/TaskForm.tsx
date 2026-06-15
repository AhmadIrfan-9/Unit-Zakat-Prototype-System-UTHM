// src/components/tasks/TaskForm.tsx
//
// "use client" is the explicit boundary marker. Everything below this directive
// runs in the browser. Prisma, auth, and DB logic CANNOT be imported here.

"use client";

import { useActionState, useEffect } from "react";
import { createTaskAction, type CreateTaskActionResult } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // or your preferred toast library

// ─── useActionState Signature ──────────────────────────────────────────────────
// useActionState<State, Payload>(action, initialState, permalink?)
// Returns: [state, dispatch, isPending]
//
// `state`     — the last value returned by the Server Action (typed as CreateTaskActionResult | null)
// `dispatch`  — the function to call; pass it as the form's `action` prop
// `isPending` — true while the Server Action is in-flight (replaces useTransition)

export function TaskForm() {
  const [state, dispatch, isPending] = useActionState<
    CreateTaskActionResult | null,
    FormData
  >(createTaskAction, null);

  // Type-safe field error accessor — narrows to the error variant before accessing fieldErrors.
  // Direct access on the union type causes TS2339 because ActionSuccess has no fieldErrors.
  const fieldErr = (field: keyof NonNullable<typeof state extends { fieldErrors?: infer E } ? E : never>) =>
    state?.status === "error" ? state.fieldErrors?.[field as keyof typeof state.fieldErrors]?.[0] : undefined;

  const errState = state?.status === "error" ? state : null;

  // React to state changes for navigation or toast feedback
  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success("Task created successfully!");
    } else if (state.status === "error" && !errState?.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      action={dispatch} // React 19: form action accepts async Server Action functions directly
      className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
      noValidate // Disable browser validation — we control the UX
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Set up CI/CD pipeline"
          aria-describedby="title-error"
          aria-invalid={!!fieldErr("title")}
          disabled={isPending}
        />
        {fieldErr("title") && (
          <p id="title-error" className="text-sm text-destructive">
            {fieldErr("title")}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional — describe the task in detail..."
          rows={4}
          aria-describedby="description-error"
          disabled={isPending}
        />
        {fieldErr("description") && (
          <p id="description-error" className="text-sm text-destructive">
            {fieldErr("description")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="priority">
            Priority <span className="text-destructive">*</span>
          </Label>
          {/*
            Shadcn Select is a controlled component — it doesn't emit a native FormData entry.
            The hidden input below bridges the gap, updated when Select changes.
            Alternatively, use a native <select> to avoid this workaround.
          */}
          <Select name="priority" defaultValue="MEDIUM" disabled={isPending}>
            <SelectTrigger id="priority" aria-describedby="priority-error">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {fieldErr("priority") && (
            <p id="priority-error" className="text-sm text-destructive">
              {fieldErr("priority")}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            aria-describedby="dueDate-error"
            disabled={isPending}
          />
          {fieldErr("dueDate") && (
            <p id="dueDate-error" className="text-sm text-destructive">
              {fieldErr("dueDate")}
            </p>
          )}
        </div>
      </div>

      {errState && !errState.fieldErrors && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {errState.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        aria-busy={isPending}
      >
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
