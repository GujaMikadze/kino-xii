import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { displayName } from "../lib/user";
import Avatar from "./Avatar";
import Ticket from "./icons/Ticket";

const itemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-white/5";

export default function UserMenu({ user }: { user: User }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = displayName(user);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3"
      >
        <Avatar user={user} />
        <span className="text-sm font-bold">{name.split(" ")[0]}</span>
        <ChevronDown
          size={16}
          className={`text-white/70 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-white/10 bg-surface p-3 shadow-2xl">
          <div className="flex items-center gap-3 px-1">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          </div>

          {user.profileComplete ? (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-xs font-bold text-success">
              Profile Complete <Check size={14} />
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2">
              <p className="text-xs font-bold text-warning">Profile incomplete</p>
              <p className="text-[11px] text-white/60">
                Please complete your profile to enable booking
              </p>
            </div>
          )}

          <div className="mt-2">
            <Link to="/profile" onClick={() => setOpen(false)} className={itemClass}>
              <UserIcon size={16} /> My Profile
            </Link>
            <Link
              to="/profile?tab=tickets"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Ticket size={16} />
              My Tickets
            </Link>
            <div className="my-2 border-t border-white/10" />
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate("/");
              }}
              className={`${itemClass} text-accent`}
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}