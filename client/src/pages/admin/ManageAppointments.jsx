import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Check,
  X,
  Trash2,
  User,
  Phone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [serviceFilter, setServiceFilter] = useState('All Services');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    actionType: null, // 'cancel', 'complete', 'delete'
    targetId: null,
    targetName: ''
  });
  const [updating, setUpdating] = useState(false);

  // View Details Modal State
  const [viewModal, setViewModal] = useState({
    open: false,
    item: null
  });

  // Fetch Appointments from Backend API
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.appointments)) {
        dataList = response.appointments;
      } else if (response && Array.isArray(response.bookings)) {
        dataList = response.bookings;
      }

      setAppointments(dataList);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Compute Available Dynamic Services List for Filter Dropdown
  const uniqueServices = Array.from(
    new Set(
      appointments
        .map((a) => a.serviceName || a.service || a.serviceTitle || '')
        .filter(Boolean)
    )
  );

  // Date Filtering Helper
  const isMatchingDateFilter = (appointmentDateStr) => {
    if (dateFilter === 'All Dates' || !appointmentDateStr) return true;
    const apptDate = new Date(appointmentDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const apptDay = new Date(apptDate);
    apptDay.setHours(0, 0, 0, 0);

    const diffTime = apptDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (dateFilter === 'Today') return diffDays === 0;
    if (dateFilter === 'Tomorrow') return diffDays === 1;
    if (dateFilter === 'This Week') return diffDays >= 0 && diffDays <= 7;
    if (dateFilter === 'This Month') {
      return (
        apptDate.getMonth() === today.getMonth() &&
        apptDate.getFullYear() === today.getFullYear()
      );
    }
    return true;
  };

  // Filter Computation
  const filteredAppointments = appointments.filter((item) => {
    if (!item) return false;

    // Search by Customer Name, Phone, or Service
    const nameStr = (item.customerName || item.name || '').toLowerCase();
    const phoneStr = (item.phone || item.mobile || '').toLowerCase();
    const serviceStr = (item.serviceName || item.service || item.serviceTitle || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || nameStr.includes(q) || phoneStr.includes(q) || serviceStr.includes(q);

    // Status Filter
    const itemStatus = (item.status || 'Pending').toLowerCase();
    const matchesStatus =
      statusFilter === 'All' || itemStatus === statusFilter.toLowerCase();

    // Date Filter
    const matchesDate = isMatchingDateFilter(item.appointmentDate || item.date || item.createdAt);

    // Service Filter
    const currentService = item.serviceName || item.service || item.serviceTitle || '';
    const matchesService =
      serviceFilter === 'All Services' || currentService === serviceFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesService;
  });

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDateFilter('All Dates');
    setServiceFilter('All Services');
  };

  // Open Status Change Confirmation Modal
  const handleOpenConfirmModal = (actionType, item) => {
    let title = '';
    let message = '';

    if (actionType === 'cancel') {
      title = 'Cancel Appointment?';
      message = 'Are you sure you want to cancel this appointment?';
    } else if (actionType === 'complete') {
      title = 'Complete Appointment?';
      message = 'Mark this appointment as completed?';
    } else if (actionType === 'delete') {
      title = 'Delete Appointment?';
      message = 'Are you sure you want to delete this appointment record? This action cannot be undone.';
    }

    setConfirmModal({
      open: true,
      title,
      message,
      actionType,
      targetId: item._id,
      targetName: item.customerName || item.name || 'Client'
    });
  };

  // Execute Confirmed Action
  const handleExecuteAction = async () => {
    const { actionType, targetId } = confirmModal;
    if (!targetId || !actionType) return;

    setUpdating(true);
    try {
      if (actionType === 'delete') {
        try {
          await api.delete(`/appointments/${targetId}`);
        } catch (e) {
          await api.delete(`/api/appointments/${targetId}`);
        }
        toast.success('Appointment Deleted Successfully');
      } else {
        const newStatus = actionType === 'cancel' ? 'Cancelled' : actionType === 'complete' ? 'Completed' : 'Confirmed';
        
        try {
          await api.patch(`/appointments/${targetId}/status`, { status: newStatus });
        } catch (e) {
          try {
            await api.put(`/appointments/${targetId}`, { status: newStatus });
          } catch (e2) {
            await api.patch(`/api/appointments/${targetId}/status`, { status: newStatus });
          }
        }

        toast.success(`Appointment Status Updated to ${newStatus}`);
      }

      setConfirmModal((prev) => ({ ...prev, open: false }));
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Action failed');
    } finally {
      setUpdating(false);
    }
  };

  // Direct Status Update (for Confirm action)
  const handleQuickConfirm = async (item) => {
    try {
      try {
        await api.patch(`/appointments/${item._id}/status`, { status: 'Confirmed' });
      } catch (e) {
        await api.put(`/appointments/${item._id}`, { status: 'Confirmed' });
      }
      toast.success('Appointment Confirmed Successfully');
      fetchAppointments();
    } catch (err) {
      console.error('Error confirming appointment:', err);
      toast.error('Failed to confirm appointment');
    }
  };

  // Format Date to "15 Aug 2026"
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format Time to "11:00 AM"
  const formatTimeDisplay = (timeString, dateString) => {
    if (timeString) return timeString;
    if (!dateString) return 'Full Day Slot';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '11:00 AM';
    }
  };

  // Relative Time ago for Created On
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const diffMs = now - d;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      return formatDateDisplay(dateString);
    } catch (e) {
      return formatDateDisplay(dateString);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (statusStr) => {
    const s = (statusStr || 'Pending').toLowerCase();
    
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          <span>Confirmed</span>
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    }

    // Default: Pending (Yellow)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
        <Clock size={12} />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Manage Appointments | Admin Portal"
        description="View, search, filter and manage customer makeup appointments."
      />

      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Manage Appointments
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              View, search, filter and manage customer appointments.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary-light border border-secondary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary shadow-xs shrink-0">
            Total Appointments : {appointments.length}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search by Name, Phone or Service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-xs font-semibold text-text-light shrink-0">Status:</label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-date" className="text-xs font-semibold text-text-light shrink-0">Date:</label>
              <select
                id="filter-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* Service Filter & Clear Button */}
            <div className="flex items-center gap-2">
              <select
                id="filter-service"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All Services">All Services</option>
                {uniqueServices.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-secondary-light text-text-light hover:text-text transition-colors cursor-pointer shrink-0"
                title="Clear Filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* Content Area: Responsive Table (Desktop/Tablet) & Mobile Cards (Mobile) */}
        {loading ? (
          <Loading fullScreen={false} />
        ) : filteredAppointments.length > 0 ? (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            
            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-bold uppercase tracking-wider text-text-light bg-background/50">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Service</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6">Created On</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredAppointments.map((item) => {
                    const status = (item.status || 'Pending').toLowerCase();
                    const initialLetter = (item.customerName || item.name || 'C').charAt(0).toUpperCase();

                    return (
                      <tr key={item._id} className="hover:bg-secondary-light/20 transition-colors">
                        
                        {/* Customer Avatar & Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                              {initialLetter}
                            </div>
                            <span className="font-bold text-text block">
                              {item.customerName || item.name || 'Client'}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 font-medium text-text-light">
                          {item.phone || item.mobile || 'N/A'}
                        </td>

                        {/* Service */}
                        <td className="py-4 px-6 font-semibold text-text">
                          {item.serviceName || item.service || item.serviceTitle || 'General Makeover'}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-text font-medium">
                          {formatDateDisplay(item.appointmentDate || item.date)}
                        </td>

                        {/* Time */}
                        <td className="py-4 px-6 text-text-light font-medium">
                          {formatTimeDisplay(item.time, item.appointmentDate || item.date)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Created On */}
                        <td className="py-4 px-6 text-text-light/80 text-[11px] font-medium">
                          {formatTimeAgo(item.createdAt || item.date)}
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setViewModal({ open: true, item })}
                              className="p-1.5 text-text-light hover:text-primary hover:bg-secondary-light rounded-full transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Confirm Action (Visible when Pending) */}
                            {status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleQuickConfirm(item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition-colors cursor-pointer"
                                title="Confirm Appointment"
                              >
                                Confirm
                              </button>
                            )}

                            {/* Complete Action (Visible when Confirmed) */}
                            {status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleOpenConfirmModal('complete', item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            )}

                            {/* Cancel Action (Visible when Pending or Confirmed) */}
                            {(status === 'pending' || status === 'confirmed') && (
                              <button
                                type="button"
                                onClick={() => handleOpenConfirmModal('cancel', item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                title="Cancel Appointment"
                              >
                                Cancel
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenConfirmModal('delete', item)}
                              className="p-1.5 text-text-light hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack View */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredAppointments.map((item) => {
                const status = (item.status || 'Pending').toLowerCase();
                const initialLetter = (item.customerName || item.name || 'C').charAt(0).toUpperCase();

                return (
                  <div key={item._id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                          {initialLetter}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-text">
                            {item.customerName || item.name || 'Client'}
                          </h3>
                          <span className="text-xs text-text-light font-medium block">
                            {item.phone || item.mobile || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div>{renderStatusBadge(item.status)}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-background border border-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-text-light font-medium">Service:</span>
                        <span className="font-bold text-text">{item.serviceName || item.service || 'Makeover'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-light font-medium">Date & Time:</span>
                        <span className="font-semibold text-text">
                          {formatDateDisplay(item.appointmentDate || item.date)} • {formatTimeDisplay(item.time, item.appointmentDate || item.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setViewModal({ open: true, item })}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleQuickConfirm(item)}
                            className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            Confirm
                          </button>
                        )}

                        {status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirmModal('complete', item)}
                            className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            Complete
                          </button>
                        )}

                        {(status === 'pending' || status === 'confirmed') && (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirmModal('cancel', item)}
                            className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenConfirmModal('delete', item)}
                          className="p-1.5 text-text-light hover:text-rose-600 rounded-full"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (

          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-border space-y-4 max-w-md mx-auto shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-light text-primary mx-auto">
              <Calendar size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Appointments Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {searchQuery || statusFilter !== 'All' || dateFilter !== 'All Dates' || serviceFilter !== 'All Services'
                  ? 'No customer appointments match your search or filter selections.'
                  : 'Customer appointment booking requests will appear here.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Clear Filters</span>
            </button>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* ACTION CONFIRMATION MODAL */}
      {/* ====================================================== */}
      {confirmModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal((prev) => ({ ...prev, open: false }));
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white text-text border border-border rounded-3xl shadow-2xl p-6 space-y-6 text-center">
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl font-bold text-text">{confirmModal.title}</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
                className="w-1/2 rounded-full bg-background border border-border hover:bg-secondary-light text-text py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={updating}
                className={`w-1/2 rounded-full text-white py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer ${
                  confirmModal.actionType === 'delete' || confirmModal.actionType === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updating ? 'Processing...' : 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* APPOINTMENT DETAILS VIEW MODAL */}
      {/* ====================================================== */}
      {viewModal.open && viewModal.item && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModal({ open: false, item: null });
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-white">
              <div>
                <h3 className="font-playfair text-xl font-bold text-text">
                  Appointment Details
                </h3>
                <p className="text-xs text-text-light mt-0.5">
                  Complete booking information for client
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewModal({ open: false, item: null })}
                className="rounded-full p-2 text-text-light hover:text-text hover:bg-secondary-light transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 bg-white text-xs">
              
              {/* Customer Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                    {(viewModal.item.customerName || viewModal.item.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">
                      {viewModal.item.customerName || viewModal.item.name || 'Client'}
                    </h4>
                    <span className="text-text-light">{viewModal.item.phone || viewModal.item.mobile || 'No phone'}</span>
                  </div>
                </div>

                <div>{renderStatusBadge(viewModal.item.status)}</div>
              </div>

              {/* Booking Information Details Grid */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Service Requested:</span>
                  <span className="font-bold text-text">{viewModal.item.serviceName || viewModal.item.service || 'Makeover'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Appointment Date:</span>
                  <span className="font-semibold text-text">{formatDateDisplay(viewModal.item.appointmentDate || viewModal.item.date)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Time Slot:</span>
                  <span className="font-semibold text-text">{formatTimeDisplay(viewModal.item.time, viewModal.item.appointmentDate || viewModal.item.date)}</span>
                </div>

                {viewModal.item.email && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-text-light font-medium">Customer Email:</span>
                    <span className="font-medium text-text">{viewModal.item.email}</span>
                  </div>
                )}

                {viewModal.item.address && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-text-light font-medium">Service Address / Location:</span>
                    <span className="font-medium text-text text-right max-w-xs">{viewModal.item.address}</span>
                  </div>
                )}

                {viewModal.item.notes && (
                  <div className="py-2 border-b border-border/60 space-y-1">
                    <span className="text-text-light font-medium block">Special Notes / Requirements:</span>
                    <p className="p-3 rounded-xl bg-background text-text leading-relaxed font-light">
                      {viewModal.item.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-text-light font-medium">Booking Created On:</span>
                  <span className="text-text-light">{formatTimeAgo(viewModal.item.createdAt || viewModal.item.date)}</span>
                </div>
              </div>

              {/* Close Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewModal({ open: false, item: null })}
                  className="w-full rounded-full bg-background border border-border hover:bg-secondary-light text-text py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  );
};

export default ManageAppointments;
