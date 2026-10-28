import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { MainLayout } from "../shared/layouts/MainLayout";
import { AuthLayout } from "../shared/layouts/AuthLayout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { HomePage } from "../features/catalogo/pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { SeatSelectionPage } from "../features/reservas/pages/SeatSelectionPage";
import { AlergenosPage } from "../features/reservas/pages/AlergenosPage";
import { ResumenReservaPage } from "../features/reservas/pages/ResumenReservaPage";
import { AdminPeliculasPage } from "../features/admin/pages/AdminPeliculasPage";
import { AdminFuncionesPage } from "../features/admin/pages/AdminFuncionesPage";
import { AdminSalasPage } from "../features/admin/pages/AdminSalasPage";
import { AdminUsuariosPage } from "../features/admin/pages/AdminUsuariosPage";
import { AdminProductosPage } from "../features/admin/pages/AdminProductosPage";
import { MenuPage } from "../features/menu/pages/MenuPage";
import { MisReservasPage } from "../features/reservas/pages/MisReservasPage";
import { AdminReservasPage } from "../features/admin/pages/AdminReservasPage";
import { FuncionesCocinaPage } from "../features/cocina/pages/FuncionesCocinaPage";
import { DetalleFuncionCocinaPage } from "../features/cocina/pages/DetalleFuncionCcinaPage";

function HomeRedirect() {
  const { isAuthenticated, usuario } = useAuthStore();

  if (isAuthenticated && usuario?.rol === "cocina") {
    return <Navigate to="/cocina" replace />;
  }

  return <HomePage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: "menu/:peliculaId", element: <MenuPage /> },
    ],

  },
  {
    path: "/reservas/asientos",
    element: <MainLayout />,
    children: [{ index: true, element: <SeatSelectionPage /> }],
  },
  {
    path: "/reservas/alergenos",
    element: <MainLayout />,
    children: [{ index: true, element: <AlergenosPage /> }],
  },
  {
    path: "/reservas/resumen",
    element: <MainLayout />,
    children: [{ index: true, element: <ResumenReservaPage /> }],
  },
  {
    path: "/reservas/historial",
    element: <MainLayout />,
    children: [{ index: true, element: <MisReservasPage /> }],
  },
  {
    path: "/reservas/activas",
    element: <MainLayout />,
    children: [{ index: true, element: <MisReservasPage /> }],
  },
  {
    path: "/reservas/mis-reservas",
    element: <MainLayout />,
    children: [{ index: true, element: <MisReservasPage /> }],
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
          },
          {
            path: "reservas",
            element: <AdminReservasPage />,
          },
        ],
      },
    ],
  },

  {
    path: "/cocina",
    element: <ProtectedRoute rolesPermitidos={["cocina"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <FuncionesCocinaPage />,
          },
          {
            path: "funciones/:id",
            element: <DetalleFuncionCocinaPage />,
          },
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

