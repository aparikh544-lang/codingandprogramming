import { createBrowserRouter } from "react-router";
import Root from "./Root";
import HomePage from "./pages/HomePage";
import BusinessDetail from "./pages/BusinessDetail";
import DealsPage from "./pages/DealsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "business/:id", Component: BusinessDetail },
      { path: "deals", Component: DealsPage },
      { path: "favorites", Component: FavoritesPage },
      { path: "profile", Component: ProfilePage },
      { path: "signup", Component: SignupPage },
      { path: "login", Component: LoginPage },
      { path: "settings", Component: SettingsPage },
      { path: "*", Component: NotFound },
    ],
  },
]);