export default function AgeBadge({ code }: { code: string }) {
  return (
    <span className="inline-block rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
      {code}
    </span>
  );
}