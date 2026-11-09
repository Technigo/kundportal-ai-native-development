import { Suspense } from "react";
import { PortalShell } from "@/components/PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // PortalShell reads the pathname, which is unknown at build time on dynamic routes such as /tickets/[id].
  // The docs recommend a Suspense boundary here. Wrapping only the pathname part of PortalShell would keep
  // more of the layout static, but it means changing a tested component.
  return (
    <Suspense>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
