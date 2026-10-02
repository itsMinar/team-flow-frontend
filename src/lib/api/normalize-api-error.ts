import axios from "axios";

export type NormalizedApiError = {
  code: string;
  message: string;
  details: Record<string, string>;
  requestId: string | undefined;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function stringDetails(value: unknown): Record<string, string> {
  const record = asRecord(value);
  if (!record) return {};

  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const body = asRecord(response?.data);
    const envelope = asRecord(body?.error);

    if (
      envelope &&
      typeof envelope.code === "string" &&
      typeof envelope.message === "string"
    ) {
      return {
        code: envelope.code,
        message: envelope.message,
        details: stringDetails(envelope.details),
        requestId:
          typeof envelope.request_id === "string"
            ? envelope.request_id
            : undefined,
      };
    }

    if (!response) {
      return {
        code: "NETWORK_ERROR",
        message:
          "The API could not be reached. Check your connection and try again.",
        details: {},
        requestId: undefined,
      };
    }

    return {
      code: "HTTP_ERROR",
      message: `The request failed with status ${response.status}.`,
      details: {},
      requestId: undefined,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
    details: {},
    requestId: undefined,
  };
}
