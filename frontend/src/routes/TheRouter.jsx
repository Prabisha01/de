import { Route, Routes } from "react-router-dom";
import MainCanvas from "../components/specific/Canvas/MainCanvas";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/private_pages/Dashboard";
import ProfilePage from "../pages/private_pages/ProfilePage";
import AppFeatures from "../pages/public_pages/AppFeatures";
import Pricings from "../pages/public_pages/PricingPage";
import RegisterPage from "../pages/RegisterPage";

const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/sign-in", element: <LoginPage /> },
  { path: "/sign-up", element: <RegisterPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/boards/:boardId/canvas", element: <MainCanvas /> },
  { path: "/features", element: <AppFeatures /> },
  { path: "/pricing", element: <Pricings /> },
  { path: "/profile", element: <ProfilePage /> },
];

export default function TheRouter() {
  return (
    <div className="flex flex-col">
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </div>
  );
}
