import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import HomePage from "../pages/HomePage";
import SessionsPage from "../pages/SessionsPage";
import MovieDetailPage from "../pages/MovieDetailPage";
import ProfilePage from "../pages/ProfilePage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/sessions", element: <SessionsPage /> },
      { path: "/movies/:slug", element: <MovieDetailPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);