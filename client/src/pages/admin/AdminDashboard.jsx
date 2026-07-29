import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Star,
  Image as ImageIcon,
  Award,
  Clock,
  Check,
  X,
  Plus,
  ArrowRight,
  User,
  MessageSquare,
  Mail,
  ShieldCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';

// Reusable Dashboard Card Component
const DashboardCard = ({ icon: Icon, title, value, subtitle, statusDotColor = 'bg-emerald-500', hasWarningAlert = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group rounded-3xl bg-surface border border-border p-5 space-y-3 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Row: Icon + Status Dot / Badge */}
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-light text-primary group-hover:scale-110 transition-transform">
          <Icon size={22} />
        </div>

        <div className="flex items-center gap-1.5">
          {hasWarningAlert && (
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          )}
          <span className={`h-2.5 w-2.5 rounded-full ${statusDotColor}`} />
        </div>
      </div>

      {/* Center: Large Value */}
      <div className="pt-1">
        <div className="font-playfair text-3xl sm:text-4xl font-bold text-text tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </div>
      </div>

      {/* Bottom: Title & Subtitle */}
      <div className="space-y-0.5 border-t border-border/50 pt-2">
        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-text">
          {title}
        </h4>
        <p className="text-[11px] font-medium text-text-light truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

// Reusable Status Badge Component
const StatusBadge = ({ status }) => {
  const normalized = (status || 'pending').toLowerCase();

  let badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  let label = 'Pending';

  if (normalized === 'confirmed' || normalized === 'approved') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Confirmed';
  } else if (normalized === 'completed') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = 'Completed';
  } else if (normalized === 'cancelled' || normalized === 'rejected') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Cancelled';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${badgeStyle}`}>
      {label}
    </span>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State Variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Statistics State (Default 0, populated strictly from backend APIs)
  const [stats, setStats] = useState({
    totalServices: 0,
    totalAppointments: 0,
    totalReviews: 0,
    totalGalleryImages: 0,
    totalCertificates: 0,
    pendingReviewsCount: 0
  });

  // Recent Lists State (Default empty arrays, populated strictly from backend APIs)
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch Dashboard Data strictly from Backend APIs
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Try unified dashboard summary API endpoint
      let response = null;
      try {
        response = await api.get('/admin/dashboard');
      } catch (e) {
        try {
          response = await api.get('/api/admin/dashboard');
        } catch (e2) {
          response = null;
        }
      }

      if (response && (response.success || response.data)) {
        const d = response.data || response;
        setStats({
          totalServices: d.totalServices || 0,
          totalAppointments: d.totalAppointments || 0,
          totalReviews: d.totalReviews || 0,
          totalGalleryImages: d.totalGalleryImages || 0,
          totalCertificates: d.totalCertificates || 0,
          pendingReviewsCount: d.pendingReviewsCount || d.pendingReviews || 0
        });

        setRecentAppointments(Array.isArray(d.recentAppointments) ? d.recentAppointments : []);
        setPendingReviews(Array.isArray(d.pendingReviewList) ? d.pendingReviewList : Array.isArray(d.pendingReviews) ? d.pendingReviews : []);
        setRecentActivities(Array.isArray(d.recentActivity) ? d.recentActivity : []);
        return;
      }

      // Step 2: Fallback to parallel individual endpoint calls
      const [
        servicesRes,
        appointmentsRes,
        reviewsRes,
        galleryRes,
        certificatesRes
      ] = await Promise.allSettled([
        api.get('/services?all=true').catch(() => api.get('/api/services')),
        api.get('/appointments').catch(() => api.get('/api/appointments')),
        api.get('/reviews').catch(() => api.get('/testimonials')).catch(() => api.get('/api/reviews')),
        api.get('/gallery').catch(() => api.get('/api/gallery')),
        api.get('/certificates').catch(() => api.get('/api/certificates'))
      ]);

      // Process Services
      const servicesList = servicesRes.status === 'fulfilled' && servicesRes.value ? (servicesRes.value.data || servicesRes.value.services || (Array.isArray(servicesRes.value) ? servicesRes.value : [])) : [];
      const totalServices = Array.isArray(servicesList) ? servicesList.length : 0;

      // Process Appointments
      const appointmentsList = appointmentsRes.status === 'fulfilled' && appointmentsRes.value ? (appointmentsRes.value.data || appointmentsRes.value.appointments || (Array.isArray(appointmentsRes.value) ? appointmentsRes.value : [])) : [];
      const totalAppointments = Array.isArray(appointmentsList) ? appointmentsList.length : 0;

      // Process Reviews & Pending Reviews
      const reviewsList = reviewsRes.status === 'fulfilled' && reviewsRes.value ? (reviewsRes.value.data || reviewsRes.value.reviews || (Array.isArray(reviewsRes.value) ? reviewsRes.value : [])) : [];
      const totalReviews = Array.isArray(reviewsList) ? reviewsList.length : 0;
      const pendingRevList = Array.isArray(reviewsList) ? reviewsList.filter(r => r && (r.approved === false || r.status === 'pending' || r.isApproved === false)) : [];

      // Process Gallery
      const galleryList = galleryRes.status === 'fulfilled' && galleryRes.value ? (galleryRes.value.data || galleryRes.value.gallery || (Array.isArray(galleryRes.value) ? galleryRes.value : [])) : [];
      const totalGalleryImages = Array.isArray(galleryList) ? galleryList.length : 0;

      // Process Certificates
      const certificatesList = certificatesRes.status === 'fulfilled' && certificatesRes.value ? (certificatesRes.value.data || certificatesRes.value.certificates || (Array.isArray(certificatesRes.value) ? certificatesRes.value : [])) : [];
      const totalCertificates = Array.isArray(certificatesList) ? certificatesList.length : 0;

      setStats({
        totalServices,
        totalAppointments,
        totalReviews,
        totalGalleryImages,
        totalCertificates,
        pendingReviewsCount: pendingRevList.length
      });

      setRecentAppointments(Array.isArray(appointmentsList) ? appointmentsList.slice(0, 5) : []);
      setPendingReviews(pendingRevList.slice(0, 5));
      setRecentActivities([]);

    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard data from backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Review Approval
  const handleApproveReview = (reviewId) => {
    setPendingReviews((prev) => prev.filter((r) => r._id !== reviewId));
    setStats((prev) => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      pendingReviewsCount: Math.max(0, prev.pendingReviewsCount - 1)
    }));
    toast.success('Review approved successfully!');
  };

  // Handle Review Rejection
  const handleRejectReview = (reviewId) => {
    setPendingReviews((prev) => prev.filter((r) => r._id !== reviewId));
    setStats((prev) => ({
      ...prev,
      pendingReviewsCount: Math.max(0, prev.pendingReviewsCount - 1)
    }));
    toast.info('Review rejected.');
  };

  // Current Formatted Date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Admin Dashboard | Ankita Makeup Portal"
        description="Comprehensive admin dashboard for managing makeup services, appointments, customer reviews, and portfolio gallery."
      />

      <div className="space-y-8">

        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              Welcome back, Admin 👋
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-surface border border-border px-4 py-2 text-xs font-semibold text-text-light shadow-xs">
            <Calendar size={15} className="text-primary" />
            <span>{todayFormatted}</span>
          </div>
        </div>

        {/* 2. Overview Statistics Cards Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Card 1: Total Services */}
            <DashboardCard
              icon={Sparkles}
              title="Total Services"
              value={stats.totalServices}
              subtitle="Active Services"
              statusDotColor="bg-emerald-500"
              onClick={() => navigate('/admin/services')}
            />

            {/* Card 2: Appointments */}
            <DashboardCard
              icon={Calendar}
              title="Appointments"
              value={stats.totalAppointments}
              subtitle="Total Bookings"
              statusDotColor="bg-blue-500"
              onClick={() => navigate('/admin/services')}
            />

            {/* Card 3: Reviews */}
            <DashboardCard
              icon={Star}
              title="Reviews"
              value={stats.totalReviews}
              subtitle="Customer Reviews"
              statusDotColor="bg-amber-500"
              onClick={() => navigate('/admin/testimonials')}
            />

            {/* Card 4: Gallery Images */}
            <DashboardCard
              icon={ImageIcon}
              title="Gallery Images"
              value={stats.totalGalleryImages}
              subtitle="Uploaded Images"
              statusDotColor="bg-purple-500"
              onClick={() => navigate('/admin/gallery')}
            />

            {/* Card 5: Certificates */}
            <DashboardCard
              icon={Award}
              title="Certificates"
              value={stats.totalCertificates}
              subtitle="Professional Certificates"
              statusDotColor="bg-indigo-500"
              onClick={() => navigate('/certificates')}
            />

            {/* Card 6: Pending Reviews */}
            <DashboardCard
              icon={Clock}
              title="Pending Reviews"
              value={stats.pendingReviewsCount}
              subtitle="Waiting For Approval"
              statusDotColor="bg-rose-500"
              hasWarningAlert={stats.pendingReviewsCount > 0}
              onClick={() => navigate('/admin/testimonials')}
            />

          </div>
        </section>

        {/* 3. Main Dashboard Layout Grid (Recent Tables + Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Recent Appointments & Pending Reviews (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Section A: Recent Appointments */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-light text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-text">Recent Appointments</h3>
                    <p className="text-[11px] text-text-light">Latest 5 client booking requests</p>
                  </div>
                </div>

                <Link
                  to="/admin/services"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Appointments Table / List */}
              {recentAppointments.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-light space-y-2">
                  <Calendar size={32} className="mx-auto text-text-light/50" />
                  <p className="font-semibold text-text">No Appointments Found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-light bg-background/50">
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Service</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {recentAppointments.slice(0, 5).map((apt) => (
                        <tr key={apt._id} className="hover:bg-secondary-light/30 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-text">
                            {apt.customerName || 'Client'}
                          </td>
                          <td className="py-3.5 px-3 text-text-light font-medium">
                            {apt.serviceName || 'Makeup Service'}
                          </td>
                          <td className="py-3.5 px-3 text-text-light font-medium">
                            {apt.date} {apt.time ? `(${apt.time})` : ''}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <StatusBadge status={apt.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section B: Pending Reviews */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-text">Pending Reviews</h3>
                    <p className="text-[11px] text-text-light">Reviews waiting for your approval</p>
                  </div>
                </div>

                <Link
                  to="/admin/testimonials"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <span>Manage Reviews</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Pending Reviews List / Table */}
              {pendingReviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-light space-y-2">
                  <Check size={32} className="mx-auto text-emerald-500/60" />
                  <p className="font-semibold text-text">No Pending Reviews Available</p>
                  <p className="text-[11px]">All customer reviews have been reviewed and approved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.slice(0, 5).map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-text">{rev.customerName}</span>
                          <span className="text-[10px] text-text-light">• {rev.serviceName}</span>
                          <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                            <Star size={12} className="fill-amber-500" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-xs text-text-light italic line-clamp-2 leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Approve / Reject Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveReview(rev._id)}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white py-1.5 px-3 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectReview(rev._id)}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white py-1.5 px-3 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Actions & Recent Activity (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Actions Panel */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
              <h3 className="font-playfair text-xl font-bold text-text border-b border-border/60 pb-3">
                Quick Actions
              </h3>

              <div className="space-y-2.5">
                <Link
                  to="/admin/services"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary-light/40 border border-secondary/60 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus size={16} />
                    <span>Add New Service</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/gallery"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-text hover:border-primary/60 hover:bg-secondary-light/30 transition-all duration-300 font-semibold text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon size={16} className="text-primary" />
                    <span>Manage Gallery</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-light" />
                </Link>

                <Link
                  to="/certificates"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-text hover:border-primary/60 hover:bg-secondary-light/30 transition-all duration-300 font-semibold text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Award size={16} className="text-primary" />
                    <span>Upload Certificate</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-light" />
                </Link>

                <Link
                  to="/admin/messages"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-text hover:border-primary/60 hover:bg-secondary-light/30 transition-all duration-300 font-semibold text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-primary" />
                    <span>View Messages</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-light" />
                </Link>

                <Link
                  to="/admin/testimonials"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-text hover:border-primary/60 hover:bg-secondary-light/30 transition-all duration-300 font-semibold text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={16} className="text-primary" />
                    <span>Manage Reviews</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-text-light" />
                </Link>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-playfair text-xl font-bold text-text">Recent Activity</h3>
                <TrendingUp size={16} className="text-primary" />
              </div>

              <div className="space-y-4 pt-1">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-text font-medium leading-relaxed">{act.text}</p>
                      <span className="text-[10px] text-text-light">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};

export default AdminDashboard;
