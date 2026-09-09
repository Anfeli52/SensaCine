import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <Outlet />
    </div>
  );
}
