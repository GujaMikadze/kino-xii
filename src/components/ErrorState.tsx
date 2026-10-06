import { TriangleAlert } from "lucide-react";

type Props = { message?: string; onRetry: () => void };

export default function ErrorState({ message = "Something went wrong", onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <TriangleAlert size={20} className="text-warning" />
      <p className="text-sm font-bold">{message}</p>
      <button
        type="button"
        onClick={() => onRetry()}
        className="h-10 rounded-full bg-field px-6 text-xs font-bold hover:bg-white/15"
      >
        Try again
      </button>
    </div>
  );
}