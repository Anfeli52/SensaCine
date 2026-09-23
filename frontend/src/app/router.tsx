import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../shared/layouts/MainLayout";
import { AuthLayout } from "../shared/layouts/AuthLayout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { HomePage } from "../features/catalogo/pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { SeatSelectionPage } from "../features/reservas/pages/SeatSelectionPage";
import { AdminPeliculasPage } from "../features/admin/pages/AdminPeliculasPage";
import { AdminFuncionesPage } from "../features/admin/pages/AdminFuncionesPage";
import { AdminSalasPage } from "../features/admin/pages/AdminSalasPage";
import { AdminUsuariosPage } from "../features/admin/pages/AdminUsuariosPage";
import { AdminProductosPage } from "../features/admin/pages/AdminProductosPage";
import { MenuPage } from "../features/menu/pages/MenuPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage />},
      { path: "menu/:peliculaId", element: <MenuPage /> },
    ],
    
  },
  {
    path: "/reservas/asientos",
    element: <MainLayout />,
    children: [{ index: true, element: <SeatSelectionPage /> }],
  },
  {
    path: "/admin",
    element: <ProtectedRoute rolesPermitidos={["admin"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/peliculas" replace />,
          },
          {
            path: "peliculas",
            element: <AdminPeliculasPage />,
          },
          {
            path: "funciones",
            element: <AdminFuncionesPage />,
          },
          {
            path: "salas",
            element: <AdminSalasPage />,
          },
          {
            path: "usuarios",
            element: <AdminUsuariosPage />,
          },
          {
            path: "productos",
            element: <AdminProductosPage />,
          }
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/register",
    element: <Navigate to="/auth/register" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

