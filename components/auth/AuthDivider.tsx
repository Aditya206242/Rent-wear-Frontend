export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-neutral-400">
      <div className="h-px flex-1 bg-neutral-200" />
      {text}
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}
