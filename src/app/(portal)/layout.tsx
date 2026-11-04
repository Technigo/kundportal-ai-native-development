import { Suspense } from "react";
import { PortalShell } from "@/components/PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // PortalShell reads the pathname, which is unknown at build time on dynamic routes such as /tickets/[id].
  return (
    <Suspense>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
