import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getSession,
  hasSavedTokens,
  restoreSession,
} from "./services/apiClient";
import LoadingScreen from "./components/ui/LoadingScreen";
import Settings from "./pages/manager/Settings";


const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const CRMLayout = lazy(() => import("./layout/CRMLayout"));
const Dashboard = lazy(() => import("./pages/manager/Dashboard"));
const Tasks = lazy(() => import("./pages/manager/Tasks"));
const Leads = lazy(() => import("./pages/admin/leads/Leads"));
const LeadDetails = lazy(() => import("./pages/admin/leads/LeadDetails"));
const Contacts = lazy(() => import("./pages/admin/contacts/Contacts"));
const Companies = lazy(() => import("./pages/admin/companies/Companies"));
const Reports = lazy(() => import("./pages/admin/reports/Reports"));
const Calendar = lazy(() => import("./pages/admin/calendar/Calendar"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const NotFound = lazy(() => import("./pages/shared/NotFound"));
const UserWelcome = lazy(() => import("./pages/shared/UserWelcome"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Home = () => (
  <Navigate
    to={
      getSession()?.user.role === "manager"
        ? "/settings"
        : getSession()?.user.role === "user"
          ? "/welcome"
          : getSession()?.user.role === "admin"
            ? "/admin"
            : "/login"
    }
    replace
  />
);

const pageTitles: Record<string, string> = {
  "/login": "Tizimga kirish",
  "/register": "Ro'yxatdan o'tish",
  "/welcome": "Xush kelibsiz",
  "/settings": "Sozlamalar",
  "/dashboard": "Dashboard",
  "/leads": "Leadlar",
  "/contacts": "Kontaktlar",
  "/companies": "Kompaniyalar",
  "/tasks": "Vazifalar",
  "/calendar": "Kalendar",
  "/reports": "Hisobotlar",
  "/admin": "Boshqaruv paneli",
};

function PageTitle() {
  const { pathname } = useLocation();
  const name = pathname.startsWith("/leads/")
    ? "Lead tafsiloti"
    : pageTitles[pathname] || "Sahifa topilmadi";
  return <Helmet title={`${name} — CRM Pro`} />;
}

export default function App() {
  const [restoring, setRestoring] = useState(hasSavedTokens);

  useEffect(() => {
    if (!hasSavedTokens()) return;

    let active = true;
    restoreSession().finally(() => {
      if (active) setRestoring(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (restoring) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <PageTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute role="user">
              <UserWelcome />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute role={["manager", "admin"]}>
              <CRMLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<ProtectedRoute role="manager"><Dashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute role="manager"><Leads /></ProtectedRoute>} />
          <Route path="/leads/:leadId" element={<ProtectedRoute role="manager"><LeadDetails /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute role="manager"><Contacts /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute role="manager"><Companies /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute role="manager"><Tasks /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute role="manager"><Calendar /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute role="manager"><Reports /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
