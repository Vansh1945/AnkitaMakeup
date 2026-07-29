import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { BookingProvider } from './context/BookingContext';

// Layout & Helpers
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import Loading from './components/common/Loading';

// Public Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const About = lazy(() => import('./pages/About'));
const Certificates = lazy(() => import('./pages/Certificates'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

// Direct Admin Page Imports (Ensures instant SPA transitions without full-screen loading flashes)
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageServices from './pages/admin/ManageServices';
import ManageGallery from './pages/admin/ManageGallery';
import ManageCertificates from './pages/admin/ManageCertificates';
import AdminMessages from './pages/admin/AdminMessages';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminSettings from './pages/admin/AdminSettings';
import ManageCategories from './pages/admin/ManageCategories';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';


const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf8]">
      {!isAdminPath && <Navbar />}
      <div className="flex-grow">{children}</div>
      {!isAdminPath && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <BookingProvider>
            <ScrollToTop />
            <MainLayout>
              <Suspense fallback={<Loading fullScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/portfolio" element={<GalleryPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />

                  {/* Services Public Routes */}
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:idOrSlug" element={<ServiceDetail />} />

                  <Route path="/about" element={<About />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<AdminLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Admin Nesting Route with ProtectedRoute and AdminLayout */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="appointments" element={<ManageAppointments />} />
                    <Route path="services" element={<ManageServices />} />
                    <Route path="gallery" element={<ManageGallery />} />
                    <Route path="certificates" element={<ManageCertificates />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="profile" element={<AdminSettings />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="categories" element={<ManageCategories />} />
                  </Route>
                </Routes>
              </Suspense>
            </MainLayout>

            {/* Toast alerts container */}
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </BookingProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
