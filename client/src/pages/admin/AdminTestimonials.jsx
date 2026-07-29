import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Trash2,
  Star,
  User,
  Search,
  RotateCcw,
  Eye,
  Check,
  X,
  AlertTriangle,
  MessageSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';

const AdminTestimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    actionType: null, // 'approve', 'reject', 'delete'
    targetId: null,
    targetName: ''
  });
  const [processing, setProcessing] = useState(false);

  // View Review Modal State
  const [viewModal, setViewModal] = useState({
    open: false,
    item: null
  });

  // Fetch Reviews from Backend API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.get('/testimonials');
      } catch (e) {
        response = await api.get('/reviews');
      }

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.reviews)) {
        dataList = response.reviews;
      } else if (response && Array.isArray(response.testimonials)) {
        dataList = response.testimonials;
      }

      setReviews(dataList);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch customer reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate Dashboard Summary Statistics
  const totalReviewsCount = reviews.length;
  const pendingReviewsCount = reviews.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'pending' || (!r.status && !r.approved);
  }).length;
  const approvedReviewsCount = reviews.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'approved' || r.approved === true;
  }).length;
  const rejectedReviewsCount = reviews.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'rejected';
  }).length;

  // Filter & Sort Computation
  const filteredReviews = reviews
    .filter((item) => {
      if (!item) return false;

      // Search by Customer Name, Phone, Service, or Review Text
      const nameMatch = (item.customerName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = (item.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
      const serviceMatch = (item.serviceName || item.service || '').toLowerCase().includes(searchQuery.toLowerCase());
      const reviewMatch = (item.review || item.comment || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || phoneMatch || serviceMatch || reviewMatch;

      // Status Filter
      const itemStatus = (item.status || (item.approved ? 'Approved' : 'Pending')).toLowerCase();
      const matchesStatus =
        statusFilter === 'All' || itemStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
      }
      if (sortBy === 'Oldest') {
        return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
      }
      if (sortBy === 'Highest Rating') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'Lowest Rating') {
        return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      return 0;
    });

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('Newest');
  };

  // Direct Approve Handler (single click, no modal)
  const handleDirectApprove = async (item) => {
    try {
      try {
        await api.put(`/testimonials/${item._id}/approve`);
      } catch (e) {
        await api.put(`/reviews/${item._id}/approve`);
      }
      toast.success('Review Approved Successfully');
      fetchReviews();
    } catch (err) {
      console.error('Error approving review:', err);
      toast.error('Failed to approve review');
    }
  };

  // Direct Reject Handler (single click, no modal)
  const handleDirectReject = async (item) => {
    try {
      try {
        await api.put(`/testimonials/${item._id}/reject`);
      } catch (e) {
        await api.put(`/reviews/${item._id}/reject`);
      }
      toast.success('Review Rejected Successfully');
      fetchReviews();
    } catch (err) {
      console.error('Error rejecting review:', err);
      toast.error('Failed to reject review');
    }
  };

  // Open Confirmation Modal Handler for Delete
  const handleOpenConfirmDialog = (actionType, item) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Review?',
      message: 'Delete this review? This action cannot be undone.',
      actionType: 'delete',
      targetId: item._id,
      targetName: item.customerName || item.name || 'Customer'
    });
  };

  // Execute Confirmed Delete Action
  const handleExecuteAction = async () => {
    const { targetId } = confirmDialog;
    if (!targetId) return;

    setProcessing(true);
    try {
      try {
        await api.delete(`/testimonials/${targetId}`);
      } catch (e) {
        await api.delete(`/reviews/${targetId}`);
      }
      toast.success('Review Deleted Successfully');
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete review');
    } finally {
      setProcessing(false);
    }
  };

  // Format Date Display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  // Render Status Badge
  const renderStatusBadge = (item) => {
    const statusStr = (item.status || (item.approved ? 'Approved' : 'Pending')).toLowerCase();

    if (statusStr === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          <span>Approved</span>
        </span>
      );
    }
    if (statusStr === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <XCircle size={12} />
          <span>Rejected</span>
        </span>
      );
    }

    // Default: Pending (Yellow Badge)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
        <ShieldAlert size={12} />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Manage Reviews | Admin Portal"
        description="Approve, reject, and manage customer reviews submitted to your website."
      />

      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Manage Reviews
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              Approve, reject, or delete customer reviews submitted to your site.
            </p>
          </div>
        </div>

        {/* 4 Summary Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Total Reviews */}
          <div className="rounded-3xl bg-surface border border-border p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Total Reviews</span>
            <div className="font-playfair text-3xl font-bold text-text">{totalReviewsCount}</div>
            <span className="text-[11px] text-text-light font-medium">All submitted feedback</span>
          </div>

          {/* Card 2: Pending Reviews */}
          <div className="rounded-3xl bg-surface border border-border p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Reviews</span>
            <div className="font-playfair text-3xl font-bold text-amber-600">{pendingReviewsCount}</div>
            <span className="text-[11px] text-amber-600/80 font-medium">Awaiting admin review</span>
          </div>

          {/* Card 3: Approved Reviews */}
          <div className="rounded-3xl bg-surface border border-border p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved Reviews</span>
            <div className="font-playfair text-3xl font-bold text-emerald-600">{approvedReviewsCount}</div>
            <span className="text-[11px] text-emerald-600/80 font-medium">Published on website</span>
          </div>

          {/* Card 4: Rejected Reviews */}
          <div className="rounded-3xl bg-surface border border-border p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Rejected Reviews</span>
            <div className="font-playfair text-3xl font-bold text-rose-600">{rejectedReviewsCount}</div>
            <span className="text-[11px] text-rose-600/80 font-medium">Hidden from website</span>
          </div>

        </div>

        {/* Search, Filter & Sort Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search by customer name, phone, service, or review text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="review-status" className="text-xs font-semibold text-text-light shrink-0">Status:</label>
              <select
                id="review-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Reviews</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                id="review-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Highest Rating">Highest Rating</option>
                <option value="Lowest Rating">Lowest Rating</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-secondary-light text-text-light hover:text-text transition-colors cursor-pointer shrink-0"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <Loading fullScreen={false} />
        ) : filteredReviews.length > 0 ? (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-bold uppercase tracking-wider text-text-light bg-background/50">
                    <th className="py-4 px-6">Customer Name</th>
                    <th className="py-4 px-6">Service</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Review</th>
                    <th className="py-4 px-6">Submitted Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReviews.map((item) => {
                    const statusStr = (item.status || (item.approved ? 'Approved' : 'Pending')).toLowerCase();

                    return (
                      <tr key={item._id} className="hover:bg-secondary-light/20 transition-colors">
                        
                        {/* Customer Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                              {(item.customerName || item.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-text block">
                              {item.customerName || item.name || 'Client'}
                            </span>
                          </div>
                        </td>

                        {/* Service Name */}
                        <td className="py-4 px-6 font-medium text-text-light">
                          {item.serviceName || item.service || 'Bridal Makeover'}
                        </td>

                        {/* Rating Stars */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={13}
                                className={
                                  idx < (item.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-border'
                                }
                              />
                            ))}
                          </div>
                        </td>

                        {/* Review Snippet */}
                        <td className="py-4 px-6 text-text-light font-normal max-w-xs truncate">
                          "{item.review || item.comment || 'No text provided'}"
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-6 text-text-light/80 text-[11px] font-medium">
                          {formatDateDisplay(item.createdAt || item.date)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          {renderStatusBadge(item)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Action */}
                            <button
                              type="button"
                              onClick={() => setViewModal({ open: true, item })}
                              className="p-1.5 text-text-light hover:text-primary hover:bg-secondary-light rounded-full transition-colors cursor-pointer"
                              title="View Full Review"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Approve Action */}
                            {statusStr !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleDirectApprove(item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                title="Approve Review"
                              >
                                Approve
                              </button>
                            )}

                            {/* Reject Action */}
                            {statusStr !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleDirectReject(item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                title="Reject Review"
                              >
                                Reject
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenConfirmDialog('delete', item)}
                              className="p-1.5 text-text-light hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Review"
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

            {/* Mobile Card Stack View */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredReviews.map((item) => {
                const statusStr = (item.status || (item.approved ? 'Approved' : 'Pending')).toLowerCase();

                return (
                  <div key={item._id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                          {(item.customerName || item.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-text">
                            {item.customerName || item.name || 'Client'}
                          </h3>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={11}
                                className={
                                  idx < (item.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-border'
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>{renderStatusBadge(item)}</div>
                    </div>

                    <p className="text-xs text-text-light italic leading-relaxed bg-background p-3 rounded-2xl border border-border font-light">
                      "{item.review || item.comment}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-text-light">
                        {formatDateDisplay(item.createdAt || item.date)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewModal({ open: true, item })}
                          className="p-1.5 text-text-light hover:text-primary rounded-full"
                        >
                          <Eye size={15} />
                        </button>

                        {statusStr !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleDirectApprove(item)}
                            className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {statusStr !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleDirectReject(item)}
                            className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenConfirmDialog('delete', item)}
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
              <MessageSquare size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Reviews Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {searchQuery || statusFilter !== 'All'
                  ? 'No customer reviews match your search or filter criteria.'
                  : 'Customer reviews submitted to your site will appear here.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* ACTION CONFIRMATION MODAL */}
      {/* ====================================================== */}
      {confirmDialog.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDialog((prev) => ({ ...prev, open: false }));
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white text-text border border-border rounded-3xl shadow-2xl p-6 space-y-6 text-center">
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl font-bold text-text">{confirmDialog.title}</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                className="w-1/2 rounded-full bg-background border border-border hover:bg-secondary-light text-text py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={processing}
                className={`w-1/2 rounded-full text-white py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer ${
                  confirmDialog.actionType === 'delete' || confirmDialog.actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* VIEW REVIEW DETAILS MODAL */}
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
                  Review Details
                </h3>
                <p className="text-xs text-text-light mt-0.5">
                  Complete customer feedback information
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
              
              {/* Customer Header & Rating */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                    {(viewModal.item.customerName || viewModal.item.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">
                      {viewModal.item.customerName || viewModal.item.name || 'Client'}
                    </h4>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={
                            idx < (viewModal.item.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-border'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>{renderStatusBadge(viewModal.item)}</div>
              </div>

              {/* Review Details Table / Grid */}
              <div className="space-y-3">
                {viewModal.item.serviceName && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-text-light font-medium">Service Provided:</span>
                    <span className="font-bold text-text">{viewModal.item.serviceName}</span>
                  </div>
                )}

                {viewModal.item.phone && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-text-light font-medium">Customer Phone:</span>
                    <span className="font-medium text-text">{viewModal.item.phone}</span>
                  </div>
                )}

                {viewModal.item.email && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-text-light font-medium">Customer Email:</span>
                    <span className="font-medium text-text">{viewModal.item.email}</span>
                  </div>
                )}

                {/* Full Review Text */}
                <div className="py-2 space-y-1">
                  <span className="text-text-light font-medium block">Full Review Text:</span>
                  <p className="p-4 rounded-2xl bg-background border border-border text-text leading-relaxed font-light italic">
                    "{viewModal.item.review || viewModal.item.comment}"
                  </p>
                </div>

                <div className="flex justify-between py-2 border-t border-border/60">
                  <span className="text-text-light font-medium">Submitted Date:</span>
                  <span className="text-text-light">{formatDateDisplay(viewModal.item.createdAt || viewModal.item.date)}</span>
                </div>
              </div>

              {/* Close Button */}
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

export default AdminTestimonials;
