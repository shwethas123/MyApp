// src/pages/ProfilePage.jsx
// ── Thin page wrapper — just renders the smart container ──────────────────────
import ProfileContainer from "../containers/ProfilePageContainer";

const ProfilePage = () => <ProfileContainer />;

export default ProfilePage;


// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS TO src/AppRoutes.jsx (inside the adopter-only ProtectedRoute block):
//
//   import ProfilePage from "./pages/ProfilePage";
//
//   <Route element={<ProtectedRoute roles={["adopter"]} />}>
//     ...existing routes...
//     <Route path="/profile" element={<ProfilePage />} />   ← add this
//   </Route>
// ─────────────────────────────────────────────────────────────────────────────