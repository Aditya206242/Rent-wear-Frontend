export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
      <div className="h-px flex-1 bg-brand-navy/10" />
      {text}
      <div className="h-px flex-1 bg-brand-navy/10" />
    </div>
  );
}
