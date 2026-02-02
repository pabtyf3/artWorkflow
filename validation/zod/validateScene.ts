import { z } from "zod";
import { coreSceneSchema, CoreScene } from "./coreScene";

type ValidationResult =
  | { ok: true; data: CoreScene }
  | { ok: false; message: string; issues: z.ZodIssue[] };

/**
 * Validates an unknown input against the Core Scene Schema.
 * Returns a discriminated union with parsed data or formatted errors.
 */

const formatIssuePath = (path: (string | number)[]): string => {
  if (path.length === 0) {
    return "<root>";
  }
  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".")
    .replace(".[", "[");
};

const formatIssues = (issues: z.ZodIssue[]): string => {
  return issues
    .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
    .join("\n");
};

export const validateCoreScene = (input: unknown): ValidationResult => {
  const result = coreSceneSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const issueCount = result.error.issues.length;
  const message = `Core Scene Schema validation failed (${issueCount} issues):\n${formatIssues(
    result.error.issues
  )}`;

  return { ok: false, message, issues: result.error.issues };
};

export const assertValidCoreScene = (input: unknown): CoreScene => {
  const result = validateCoreScene(input);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
};
