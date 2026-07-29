import React, { useState, useEffect } from 'react';
import {
  Mail,
  Trash2,
  CheckCircle2,
  Eye,
  Search,
  RotateCcw,
  X,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Unread', 'Read'

  // View Modal State
  const [viewModal, setViewModal] = useState({
    open: false,
    item: null
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch Contact Messages from Backend API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contact');

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.messages)) {
        dataList = response.messages;
      }

      setMessages(dataList);
    } catch (err) {
      console.error('Error loading contact messages:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Compute Summary Statistics
  const totalMessagesCount = messages.length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;
  const readMessagesCount = totalMessagesCount - unreadMessagesCount;

  // Filter Computation (Newest First by Default)
  const filteredMessages = messages
    .filter((item) => {
      if (!item) return false;

      // Search by Name, Email, Phone, or Subject
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const emailMatch = (item.email || '').toLowerCase().includes(q);
      const phoneMatch = (item.phone || '').toLowerCase().includes(q);
      const subjectMatch = (item.subject || '').toLowerCase().includes(q);

      const matchesSearch = !q || nameMatch || emailMatch || phoneMatch || subjectMatch;

      // Status Filter
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Unread' && !item.isRead) ||
        (statusFilter === 'Read' && item.isRead);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  // Mark Message as Read
  const handleMarkRead = async (item) => {
    if (!item || item.isRead) return;
    try {
      try {
        await api.patch(`/contact/${item._id}/read`);
      } catch (e) {
        await api.put(`/contact/${item._id}/read`);
      }

      // Immediately update UI without page refresh
      setMessages((prev) =>
        prev.map((msg) => (msg._id === item._id ? { ...msg, isRead: true } : msg))
      );

      // If view modal is open for this item, update modal state
      if (viewModal.item && viewModal.item._id === item._id) {
        setViewModal((prev) => ({
          ...prev,
          item: { ...prev.item, isRead: true }
        }));
      }

      toast.success('Message marked as read.');
    } catch (err) {
      console.error('Error marking message as read:', err);
      toast.error('Failed to update message.');
    }
  };

  // Open View Modal
  const handleOpenViewModal = (item) => {
    setViewModal({ open: true, item });
    // Automatically mark as read when viewed if currently unread
    if (!item.isRead) {
      handleMarkRead(item);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ open: true, item });
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    const targetId = deleteModal.item._id;

    setDeleting(true);
    try {
      await api.delete(`/contact/${targetId}`);

      // Instantly remove row and update stats
      setMessages((prev) => prev.filter((m) => m._id !== targetId));
      setDeleteModal({ open: false, item: null });

      if (viewModal.item && viewModal.item._id === targetId) {
        setViewModal({ open: false, item: null });
      }

      toast.success('Message deleted successfully.');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Contact Messages | Admin Portal"
        description="View and manage customer contact messages and inquiries."
      />

      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Contact Messages
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              View, read and manage customer contact form inquiries.
            </p>
          </div>
        </div>

        {/* 3 Summary Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Total Messages */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Total Messages</span>
              <div className="font-playfair text-3xl font-bold text-text">{totalMessagesCount}</div>
              <span className="text-[11px] text-text-light font-medium">All customer inquiries</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-primary">
              <Mail size={24} />
            </div>
          </div>

          {/* Card 2: Unread Messages */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Unread Messages</span>
              <div className="font-playfair text-3xl font-bold text-rose-600">{unreadMessagesCount}</div>
              <span className="text-[11px] text-rose-600/80 font-medium">Requires admin attention</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <Mail size={24} />
            </div>
          </div>

          {/* Card 3: Read Messages */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Read Messages</span>
              <div className="font-playfair text-3xl font-bold text-emerald-600">{readMessagesCount}</div>
              <span className="text-[11px] text-emerald-600/80 font-medium">Reviewed by admin</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>
          </div>

        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search by Name, Email, Phone, or Subject..."
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
                <option value="All">All Messages</option>
                <option value="Unread">Unread Only</option>
                <option value="Read">Read Only</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 p-2.5 rounded-2xl border border-border bg-background hover:bg-secondary-light text-xs font-semibold text-text-light hover:text-text transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Reset Filters</span>
              </button>
            </div>

          </div>
        </div>

        {/* Messages Content Table / Cards */}
        {loading ? (
          <Loading fullScreen={false} />
        ) : filteredMessages.length > 0 ? (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-bold uppercase tracking-wider text-text-light bg-background/50">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Subject</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMessages.map((item) => {
                    const isUnread = !item.isRead;

                    return (
                      <tr key={item._id} className="hover:bg-secondary-light/20 transition-colors">
                        
                        {/* Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                              {(item.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-bold ${isUnread ? 'text-text' : 'text-text-light'}`}>
                              {item.name || 'Client'}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 font-medium text-text-light">
                          {item.phone || 'N/A'}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 font-medium text-text-light">
                          {item.email || 'N/A'}
                        </td>

                        {/* Subject */}
                        <td className="py-4 px-6 font-bold text-text max-w-xs truncate">
                          {item.subject || 'General Inquiry'}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-text-light/80 text-[11px] font-medium">
                          {formatDateDisplay(item.createdAt)}
                        </td>

                        {/* Status Badge: Unread (Red) / Read (Green) */}
                        <td className="py-4 px-6 text-center">
                          {isUnread ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              <Mail size={12} />
                              <span>Unread</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={12} />
                              <span>Read</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(item)}
                              className="p-1.5 text-text-light hover:text-primary hover:bg-secondary-light rounded-full transition-colors cursor-pointer"
                              title="View Message"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Mark Read */}
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkRead(item)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                title="Mark as Read"
                              >
                                Mark Read
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenDeleteModal(item, e)}
                              className="p-1.5 text-text-light hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Message"
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

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredMessages.map((item) => {
                const isUnread = !item.isRead;

                return (
                  <div key={item._id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary-light border border-secondary text-primary font-bold flex items-center justify-center shrink-0">
                          {(item.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-text">{item.name || 'Client'}</h3>
                          <span className="text-xs text-text-light">{item.email}</span>
                        </div>
                      </div>

                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          Read
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl bg-background border border-border text-xs space-y-1">
                      <span className="font-bold text-text block">{item.subject || 'General Inquiry'}</span>
                      <p className="text-text-light line-clamp-2 italic font-light">"{item.message}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-text-light">{formatDateDisplay(item.createdAt)}</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenViewModal(item)}
                          className="p-1.5 text-text-light hover:text-primary rounded-full"
                        >
                          <Eye size={15} />
                        </button>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(item)}
                            className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            Mark Read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteModal(item, e)}
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
              <Mail size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Contact Messages Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                You're all caught up! Customer contact form inquiries will appear here.
              </p>
            </div>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ====================================================== */}
      {deleteModal.open && deleteModal.item && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModal({ open: false, item: null });
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white text-text border border-border rounded-3xl shadow-2xl p-6 space-y-6 text-center">
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl font-bold text-text">Delete Message?</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Delete this contact message? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="w-1/2 rounded-full bg-background border border-border hover:bg-secondary-light text-text py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-1/2 rounded-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* VIEW MESSAGE MODAL */}
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
                  Contact Message Details
                </h3>
                <p className="text-xs text-text-light mt-0.5">
                  Complete customer inquiry information
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
                    {(viewModal.item.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">{viewModal.item.name || 'Client'}</h4>
                    <span className="text-text-light">{viewModal.item.email}</span>
                  </div>
                </div>

                <div>
                  {!viewModal.item.isRead ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 text-[10px] font-bold uppercase">
                      Unread
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase">
                      Read
                    </span>
                  )}
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Phone Number:</span>
                  <span className="font-bold text-text">{viewModal.item.phone || 'N/A'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Subject:</span>
                  <span className="font-bold text-text">{viewModal.item.subject || 'General Inquiry'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-text-light font-medium">Submission Date:</span>
                  <span className="font-semibold text-text">{formatDateDisplay(viewModal.item.createdAt)}</span>
                </div>

                {/* Message Content */}
                <div className="py-2 space-y-1">
                  <span className="text-text-light font-medium block">Full Message:</span>
                  <p className="p-4 rounded-2xl bg-background border border-border text-text leading-relaxed font-light whitespace-pre-line">
                    {viewModal.item.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setViewModal({ open: false, item: null })}
                  className="rounded-full bg-background border border-border hover:bg-secondary-light text-text px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>

                {!viewModal.item.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(viewModal.item)}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(viewModal.item)}
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  );
};

export default AdminMessages;
