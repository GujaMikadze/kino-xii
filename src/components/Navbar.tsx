import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import UserMenu from "./UserMenu";
import SearchBox from "./SearchBox";

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { user, isBooting, openAuthModal } = useAuth();

  return (
    <header className={`${
        overlay ? "absolute inset-x-0 top-0" : "relative"
      } z-40 flex items-center gap-8 px-15 pt-7.5 pb-10 bg-[linear-gradient(180deg,#000000_-212.35%,rgba(0,0,0,0.51)_32.09%,rgba(0,0,0,0)_93.93%)]`}>
      <Link to="/" className="text-[1.25rem] tracking-wide font-extrabold text-white mr-1">
        KINO <span className="text-accent">XII</span>
      </Link>

      <Link to="/sessions" className="text-xs font-semibold tracking-wider">
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