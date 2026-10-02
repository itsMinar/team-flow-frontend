import type { components } from "@/types/api";

export type ApiResponse<T> = Omit<
  components["schemas"]["SuccessEnvelope"],
  "data"
> & { data: T };

export type Paginated<T> = Omit<
  components["schemas"]["PageEnvelope"],
  "data"
> & { data: T[] };

export type ApiError = components["schemas"]["ErrorEnvelope"];
