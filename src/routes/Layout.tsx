import { Outlet, useLocation } from "react-router-dom";
import AuthModals from "../auth/AuthModals";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Layout() {
  const { pathname } = useLocation();
  const fullBleed = pathname === "/" || pathname.startsWith("/movies/");

  return (
    <div className="min-h-screen">
      <Navbar overlay={fullBleed} />
      <main className={fullBleed ? "" : "px-15 pb-10 min-h-[calc(100vh-235px)]"}>
        <Outlet />
      </main>
      <Footer />
      <AuthModals />
    </div>
  );
}