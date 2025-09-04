// src/components/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === "/" || location.pathname === "/signup";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Header />}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}
