import { OrganizationPicker } from "@/features/organizations/organization-picker";

export default function OrganizationsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
        TeamFlow
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Choose a workspace
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#64756c]">
        Select an organization to continue to its projects and tasks.
      </p>
      <div className="mt-8">
        <OrganizationPicker />
      </div>
    </main>
  );
}
