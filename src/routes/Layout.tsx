import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header className="flex gap-6 p-4 border-b">
        <Link to="/" className="font-bold">Kino XII</Link>
        <Link to="/sessions">Sessions</Link>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}