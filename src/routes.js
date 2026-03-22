import Admin from "./pages/Admin";
import {ADMIN_ROUTE, BASKET_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE, PRODUCT_ROUTE, ORDERS_ROUTE} from "./utils/consts";
import Basket from "./pages/Basket";
import Shop from "./pages/Shop";
import Auth from "./pages/Auth";
import ProductPage from "./pages/ProductPage";
import Orders from "./pages/Orders"; // Новый импорт
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Support from "./pages/Support";
import Download from "./pages/Download";
import Library from "./pages/Library";

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin,
    },
    {
        path: BASKET_ROUTE,
        Component: Basket
    },
    {
        path: ORDERS_ROUTE,
        Component: Orders
    },
    {
        path: "/library",
        Component: Library,
    },
]

export const publicRoutes = [
    {
        path: SHOP_ROUTE,
        Component: Shop,
    },
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth,
    },
    {
        path: PRODUCT_ROUTE + '/:id',
        Component: ProductPage
    },
    {
        path: "/forgot-password",
        Component: ForgotPassword,
    },
    {
        path: "/reset-password/:token",
        Component: ResetPassword,
    },
    {
        path: "/support",
        Component: Support,
    },
    {
        path: "/download",
        Component: Download,
    },
]