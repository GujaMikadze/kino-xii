import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import UserMenu from "./UserMenu";
import SearchBox from "./SearchBox";

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { user, isBooting, openAuthModal } = useAuth();

  return (
    <header className={`${
        overlay ? "absolute inset-x-0 top-0" : "relative"
      } z-40 flex h-24 items-center gap-10 px-30`}>
      <Link to="/" className="text-lg font-black tracking-wide">
        KINO <span className="text-accent">XII</span>
      </Link>

      <Link to="/sessions" className="text-xs font-bold tracking-wider">
        SESSIONS
      </Link>

      <SearchBox />

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