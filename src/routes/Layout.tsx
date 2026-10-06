import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModals from "../auth/AuthModals";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-6 py-4">
        <Outlet />
      </main>
      <AuthModals />
    </div>
  );
}