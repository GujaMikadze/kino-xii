type AgeBadgeProps = {
  code: string;
  className?: string;
};

export default function AgeBadge({ code, className }: AgeBadgeProps) {
  return (
    <span className={`${className || "px-3 py-1.5"} inline-block min-w-11.5 text-center rounded-full bg-accent/10 backdrop-blur-2xl text-[12px] font-bold text-accent`}>
      {code}
    </span>
  );
}