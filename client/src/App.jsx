import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import LoadingScreen from "./components/ui/LoadingScreen";
const About = lazy(() => import("./pages/About"));
const Programs = lazy(() => import("./pages/Programs"));
const Events = lazy(() => import("./pages/Events"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GetInvolved = lazy(() => import("./pages/GetInvolved"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const RequireAdminAuth = lazy(() => import("./admin/components/RequireAdminAuth"));
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const AdminOverview = lazy(() => import("./admin/pages/Overview"));
const AdminWebsiteContent = lazy(() => import("./admin/pages/WebsiteContent"));
const AdminGallery = lazy(() => import("./admin/pages/Gallery"));
const AdminVolunteers = lazy(() => import("./admin/pages/Volunteers"));
const AdminBloodRequests = lazy(() => import("./admin/pages/BloodRequests"));
const AdminPartners = lazy(() => import("./admin/pages/Partners"));
const AdminMessages = lazy(() => import("./admin/pages/Messages"));
const AdminNewsletter = lazy(() => import("./admin/pages/Newsletter"));
const AdminEvents = lazy(() => import("./admin/pages/Events"));
const AdminRegistrations = lazy(() => import("./admin/pages/Registrations"));
const AdminCheckin = lazy(() => import("./admin/pages/Checkin"));
const AdminFeedback = lazy(() => import("./admin/pages/Feedback"));
const AdminNotifications = lazy(() => import("./admin/pages/Notifications"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const RequireAdminPermission = lazy(() => import("./admin/components/RequireAdminPermission"));
const PortalLogin = lazy(() => import("./portal/pages/PortalLogin"));
const ForgotPassword = lazy(() => import("./portal/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./portal/pages/ResetPassword"));
const VerifyVolunteer = lazy(() => import("./portal/pages/VerifyVolunteer"));
const VerifyCertificate = lazy(() => import("./portal/pages/VerifyCertificate"));
const RequirePortalAuth = lazy(() => import("./portal/components/RequirePortalAuth"));
const PortalLayout = lazy(() => import("./portal/components/PortalLayout"));
const PortalOverview = lazy(() => import("./portal/pages/Overview"));
const PortalIdCard = lazy(() => import("./portal/pages/IdCard"));
const PortalEvents = lazy(() => import("./portal/pages/PortalEvents"));
const PortalAttendance = lazy(() => import("./portal/pages/Attendance"));
const PortalCertificates = lazy(() => import("./portal/pages/Certificates"));
const PortalBlood = lazy(() => import("./portal/pages/Blood"));
const PortalProfile = lazy(() => import("./portal/pages/Profile"));
const PortalNotifications = lazy(() => import("./portal/pages/Notifications"));
const PortalDownloads = lazy(() => import("./portal/pages/Downloads"));
export default function App() {
  return <Suspense fallback={<LoadingScreen />}><Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="programs" element={<Programs />} />
        <Route path="events" element={<Events />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="get-involved" element={<GetInvolved />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route element={<RequireAdminPermission permission="website" />}><Route path="website" element={<AdminWebsiteContent />} /></Route>
          <Route element={<RequireAdminPermission permission="gallery" />}><Route path="gallery" element={<AdminGallery />} /></Route>
          <Route element={<RequireAdminPermission permission="volunteers" />}><Route path="volunteers" element={<AdminVolunteers />} /></Route>
          <Route element={<RequireAdminPermission permission="blood_requests" />}><Route path="blood-requests" element={<AdminBloodRequests />} /></Route>
          <Route element={<RequireAdminPermission permission="partners" />}><Route path="partners" element={<AdminPartners />} /></Route>
          <Route element={<RequireAdminPermission permission="messages" />}><Route path="messages" element={<AdminMessages />} /></Route>
          <Route element={<RequireAdminPermission permission="newsletter" />}><Route path="newsletter" element={<AdminNewsletter />} /></Route>
          <Route element={<RequireAdminPermission permission="events" />}><Route path="events" element={<AdminEvents />} /></Route>
          <Route element={<RequireAdminPermission permission="registrations" />}><Route path="registrations" element={<AdminRegistrations />} /></Route>
          <Route element={<RequireAdminPermission permission="checkin" />}><Route path="checkin" element={<AdminCheckin />} /></Route>
          <Route element={<RequireAdminPermission permission="feedback" />}><Route path="feedback" element={<AdminFeedback />} /></Route>
          <Route element={<RequireAdminPermission permission="notifications" />}><Route path="notifications" element={<AdminNotifications />} /></Route>
          <Route element={<RequireAdminPermission superAdmin />}><Route path="admin-users" element={<AdminUsers />} /></Route>
        </Route>
      </Route>

      <Route path="portal/login" element={<PortalLogin />} />
      <Route path="portal/forgot-password" element={<ForgotPassword />} />
      <Route path="portal/reset-password" element={<ResetPassword />} />
      <Route path="portal/verify" element={<VerifyVolunteer />} />
      <Route path="portal/certificate-verify" element={<VerifyCertificate />} />
      <Route path="portal" element={<RequirePortalAuth />}>
        <Route element={<PortalLayout />}>
          <Route index element={<PortalOverview />} />
          <Route path="idcard" element={<PortalIdCard />} />
          <Route path="events" element={<PortalEvents />} />
          <Route path="attendance" element={<PortalAttendance />} />
          <Route path="certificates" element={<PortalCertificates />} />
          <Route path="blood" element={<PortalBlood />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="notifications" element={<PortalNotifications />} />
          <Route path="downloads" element={<PortalDownloads />} />
        </Route>
      </Route>
    </Routes></Suspense>;
}
