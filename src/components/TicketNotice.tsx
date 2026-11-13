const notices: Record<string, string> = {
  "ticket-not-found": "This ticket does not exist.",
};

export function TicketNotice({ notice }: { notice: string | undefined }) {
  const message = notice !== undefined && Object.hasOwn(notices, notice) ? notices[notice] : undefined;
  if (!message) return null;

  return (
    <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {message}
    </p>
  );
}
