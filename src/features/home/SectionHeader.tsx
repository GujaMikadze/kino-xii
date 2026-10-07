import { Link } from "react-router-dom";

type Props = { title: string; to?: string };

export default function SectionHeader({ title, to }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between px-15 relative z-10">
      <h2 className="text-[1.5rem] font-extrabold uppercase tracking-wider">{title}</h2>
      {to && (
        <Link to={to} className="text-sm font-bold text-accent hover:underline">
          See all
        </Link>
      )}
    </div>
  );
}