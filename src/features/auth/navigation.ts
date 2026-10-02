export function safeNextPath(candidate: string | null): string {
  if (!candidate) return "/orgs";

  try {
    const baseUrl = "http://teamflow.local";
    const target = new URL(candidate, baseUrl);
    if (target.origin !== baseUrl) return "/orgs";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/orgs";
  }
}
