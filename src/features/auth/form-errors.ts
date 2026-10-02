import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

export function mapApiErrorToForm<T extends FieldValues>(
  error: unknown,
  fields: readonly FieldPath<T>[],
  setError: UseFormSetError<T>,
): string {
  const normalized = normalizeApiError(error);
  if (normalized.code !== "VALIDATION_ERROR") return normalized.message;

  const unmatchedMessages: string[] = [];
  for (const [field, message] of Object.entries(normalized.details)) {
    const formField = field as FieldPath<T>;
    if (fields.includes(formField)) {
      setError(formField, { type: "server", message });
    } else {
      unmatchedMessages.push(message);
    }
  }

  if (unmatchedMessages.length > 0) {
    return [...new Set(unmatchedMessages)].join(" ");
  }

  return Object.keys(normalized.details).length === 0 ? normalized.message : "";
}
