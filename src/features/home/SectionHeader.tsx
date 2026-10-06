import { Link } from "react-router-dom";

type Props = { title: string; to?: string };

export default function SectionHeader({ title, to }: Props) {
  return (
    <div className="mb-5 flex items-center justify-between px-30">
      <h2 className="text-sm font-extrabold uppercase tracking-wider">{title}</h2>
      {to && (
        <Link to={to} className="text-xs font-bold text-accent hover:underline">
          See all
        </Link>
      )}
    </div>
  );
}