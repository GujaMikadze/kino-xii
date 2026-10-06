import type { User } from "../api/types";
import { displayName, initials } from "../lib/user";

export default function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full rounded-lg object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center rounded-lg bg-field text-xs font-bold">
          {initials(displayName(user))}
        </div>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-surface ${
          user.profileComplete ? "bg-success" : "bg-warning"
        }`}
      />
    </div>
  );
}