import { Routes, Route } from "react-router-dom";
import { DashboardNavbar, Footer } from "@/widgets/layout";
import routes from "@/routes";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-gray-50/50 p-4">

      {/* ไม่มี Sidenav ไม่มี Configurator ไม่มีปุ่ม ไม่มี left bar */}
      <DashboardNavbar />

      <div className="mt-6">
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }, index) => (
                <Route key={index} path={path} element={element} />
              ))
          )}
        </Routes>
      </div>

      <div className="text-blue-gray-600 pt-10">
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;
