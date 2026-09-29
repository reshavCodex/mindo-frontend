import AmbientBackground from "../components/ui/AmbientBackground";
import LoadingScreen from "../components/ui/LoadingScreen";
import { Outlet } from "react-router-dom";

export default function SiteLayout() {
  return (
    <div className="relative">
      {/* Global Mindo ambient background */}
      <AmbientBackground />

      {/* Routed page content */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Calm loading moment on every page load / reload */}
      <LoadingScreen />
    </div>
  );
}
