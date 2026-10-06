import { Outlet, useLocation } from "react-router-dom";
import AuthModals from "../auth/AuthModals";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Layout() {
  const isHome = useLocation().pathname === "/";

  return (
    <div className="min-h-screen">
      <Navbar overlay={isHome} />
      <main className={isHome ? "" : "px-30 pb-10"}>
        <Outlet />
      </main>
      <Footer />
      <AuthModals />
    </div>
  );
}