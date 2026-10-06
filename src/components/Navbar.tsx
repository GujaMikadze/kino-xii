import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user, isBooting, openAuthModal } = useAuth();

  return (
    <header className="relative z-40 flex h-24 items-center gap-10 px-30">
      <Link to="/" className="text-lg font-black tracking-wide">
        KINO <span className="text-accent">XII</span>
      </Link>

      <Link to="/sessions" className="text-xs font-bold tracking-wider">
        SESSIONS
      </Link>

      <div className="relative ml-auto w-[390px]">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70"
        />
        <input
          type="search"
          placeholder="Search films and live events"
          className="h-10 w-full rounded-full bg-white/10 pl-9 pr-4 text-xs outline-none placeholder:text-white/70"
        />
      </div>

      {isBooting ? (
        <div className="h-10 w-28" />
      ) : user ? (
        <UserMenu user={user} />
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openAuthModal("register")}
            className="h-10 rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="h-10 rounded-full bg-white px-6 text-xs font-bold text-black hover:bg-white/90"
          >
            Log in
          </button>
        </div>
      )}
    </header>
  );
}