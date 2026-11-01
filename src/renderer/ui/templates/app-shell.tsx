import type { ReactNode } from "react";

/** Page frame with a `header` slot above a centered, full-height main area for `children`. */
export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {header}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
