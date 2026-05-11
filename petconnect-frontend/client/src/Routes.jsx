// src/AppRoutes.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import useAuth from "./hooks/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowsePetsPage from "./pages/BrowsePetsPage";
import PetDetailPage from "./pages/PetDetailPage";
import ResetPasswordPage from "./pages/Resetpasswordpage";
import ForgotPasswordPage from "./pages/Forgotpasswordpage";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";
import AddPetPage from "./pages/AddPetPage";
import HomePage from "./pages/HomePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ShelterBasePage from "./pages/ShelterBasePage";
import NgoRegistration from "./pages/NgoRegistration";
import WaitingPage from "./pages/WaitingPage";
import NgoDashboard from "./pages/NGODashboard";
import EditPetPage from "./pages/EditPetPage";
import AdoptionApplicationPage from "./pages/AdoptionApplicationPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import AdoptionRequests from "./pages/ShelterAdoptionRequests.jsx";
import ShelterApplicationDetailPage from "./pages/ShelterApplicationDetailPage";
import GovernmentRegistrationPage from "./pages/GovernmentRegistrationPage";
import RescuerRegistrationPage from "./pages/RescuerRegistrationPage";
import MessagesPage from "./pages/MessagesPage";
import AnalyticsPage from "./pages/AnalyticsPage";

import Footer from "./components/common/Footer";
import AdminDashboard from "./pages/AdminDashboard";
import ShelterManagement from "./pages/ShelterManagement";
import UserManagement from "./pages/UserManagement";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";

import WishlistPage from "./pages/WishListPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ShelterDetail from "./pages/ShelterDetail";
import AdminReportDetail from "./pages/AdminReportDetail.jsx";
import ShelterProfileContainer from "./pages/ShelterProfilePage.jsx";
import AdminAdoptionDetail from "./pages/AdminAdoptionDetails.jsx";
import AdminUserDetailPage from "./pages/AdminUserDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import OAuthCompletePage from "./pages/OAuthCompletePage.jsx";


const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = [
    "/",
    "/forgot-password",
    "/reset-password",
    "/shelter-register",
    "/shelter/ngo-register",
    "/shelter/waiting-area",
    "/shelter/government-register",
    "/shelter/rescuer-register",
    "/complete-profile",
    "/oauth-complete",
  ];

  const showNavbar = !hideNavbarOn.includes(location.pathname);

  const hideFooterOn = [
    "/shelter/waiting-area",
    "/shelter/adoptions/:applicationId",
  ];
  const showFooter = !hideFooterOn.includes(location.pathname);


  return (
    <>
      {showNavbar && <Navbar />}
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/browse" element={<BrowsePetsPage />} />

          {/* ANY LOGGED IN USER */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/complete-profile"
                element={<ProfileCompletionPage />}
              />
              <Route
                path="/oauth-complete"
                element={<OAuthCompletePage />}
              />
            </Route>

          {/* ADOPTER ONLY */}
          <Route element={<ProtectedRoute roles={["adopter"]} />}>
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route
              path="/pets/:id/apply"
              element={<AdoptionApplicationPage />}
            />
            <Route
              path="/my-applications/:applicationId"
              element={<ApplicationDetailsPage />}
            />
            <Route path="/my-wishlist" element={<WishlistPage />} />
            <Route path="/my-profile" element={<ProfilePage />} />
          </Route>

        {/* ── SHELTER + ADMIN ──────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["shelter", "admin"]} />}>
            <Route path="/shelter/pets" element={<NgoDashboard />} />
            <Route path="/shelter/adoptions" element={<AdoptionRequests />} />
            <Route
              path="/shelter/adoptions/:applicationId"
              element={<ShelterApplicationDetailPage />}
            />
            <Route path="/shelter/pets/add" element={<AddPetPage />} />
            <Route path="/shelter/pets/:id/add" element={<AddPetPage />} />
            <Route path="/shelter/pets/:id/edit" element={<EditPetPage />} />
            <Route path="/shelter-register" element={<ShelterBasePage />} />
            <Route path="/shelter/ngo-register" element={<NgoRegistration />} />
            <Route
              path="/shelter/government-register"
              element={<GovernmentRegistrationPage />}
            />
            <Route
              path="/shelter/rescuer-register"
              element={<RescuerRegistrationPage />}
            />
            <Route path="/shelter/waiting-area" element={<WaitingPage />} />
            <Route path="/shelter/messages" element={<MessagesPage />} />
            <Route path="/shelter/analytics" element={<AnalyticsPage />} />
            {/* ✅ Shelter profile route */}
            <Route
              path="/shelter/profile"
              element={<ShelterProfileContainer />}
            />
          </Route>

        {/* ── ADMIN ONLY ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/shelters" element={<ShelterManagement />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/shelters/:id" element={<ShelterDetail />} />
           <Route path="/admin/adoptions/:id" element={<AdminAdoptionDetail />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/reports/:id" element={<AdminReportDetail />} />
            <Route path="/admin/applications/:id" element={<AdminAdoptionDetail />} />
          </Route>

          {/* CATCH ALL */}
          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
