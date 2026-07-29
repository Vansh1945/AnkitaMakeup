import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Award,
  Search,
  RotateCcw,
  X,
  AlertTriangle,
  Calendar,
  Building,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';

const ManageCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    institute: '',
    date: '',
    image: ''
  });
  const [fileInput, setFileInput] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Certificates from Backend API
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.get('/certificates');
      } catch (e) {
        response = await api.get('/api/certificates');
      }

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.certificates)) {
        dataList = response.certificates;
      }

      setCertificates(dataList);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Filter & Sort Certificates Computation
  const filteredCertificates = certificates
    .filter((cert) => {
      if (!cert) return false;
      const titleMatch = (cert.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const instMatch = (cert.institute || '').toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || instMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
      }
      if (sortBy === 'Oldest') {
        return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
      }
      return 0;
    });

  // Handle File Upload Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      setFileInput(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, image: url }));
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: '' }));
      }
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCertId(null);
    setFormData({
      title: '',
      institute: '',
      date: new Date().toISOString().split('T')[0],
      image: ''
    });
    setFileInput(null);
    setImagePreview('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cert) => {
    setEditingCertId(cert._id);
    const existingImg = cert.image || cert.imageUrl || '';
    setFormData({
      title: cert.title || '',
      institute: cert.institute || '',
      date: cert.date || '',
      image: existingImg
    });
    setFileInput(null);
    setImagePreview(existingImg);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setImagePreview(value);
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Add/Edit Form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Certificate Title is required';
    if (!formData.institute.trim()) errors.institute = 'Institute Name is required';
    if (!formData.date.trim()) errors.date = 'Completion Date is required';
    if (!editingCertId && !fileInput) {
      errors.image = 'Please upload a certificate image file';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('institute', formData.institute.trim());
      payload.append('date', formData.date.trim());

      if (fileInput) {
        payload.append('image', fileInput);
      } else if (editingCertId) {
        payload.append('image', formData.image);
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingCertId) {
        await api.put(`/certificates/${editingCertId}`, payload, { headers });
        toast.success('Certificate Updated Successfully');
      } else {
        await api.post('/certificates', payload, { headers });
        toast.success('Certificate Added Successfully');
      }

      setIsModalOpen(false);
      fetchCertificates();
    } catch (err) {
      console.error('Error saving certificate:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save certificate');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Handlers
  const handleOpenDeleteModal = (cert) => {
    setCertToDelete(cert);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!certToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/certificates/${certToDelete._id}`);
      toast.success('Certificate Deleted Successfully');
      setDeleteModalOpen(false);
      setCertToDelete(null);
      fetchCertificates();
    } catch (err) {
      console.error('Error deleting certificate:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete certificate');
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
        title="Manage Certificates | Admin Portal"
        description="Add, view, edit and delete professional beauty certificates."
      />

      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Manage Certificates
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              Add, view, edit and delete professional beauty certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Certificate</span>
          </button>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search by Title or Institute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-cert" className="text-xs font-semibold text-text-light shrink-0">Sort:</label>
              <select
                id="sort-cert"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('Newest');
                }}
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
        ) : filteredCertificates.length > 0 ? (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-bold uppercase tracking-wider text-text-light bg-background/50">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Institute</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCertificates.map((cert) => {
                    const imgUrl = cert.image || cert.imageUrl;

                    return (
                      <tr key={cert._id} className="hover:bg-secondary-light/20 transition-colors">
                        
                        {/* Certificate Image Thumbnail */}
                        <td className="py-4 px-6">
                          <div className="h-12 w-16 rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={cert.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Award size={20} className="text-text-light/50" />
                            )}
                          </div>
                        </td>

                        {/* Title */}
                        <td className="py-4 px-6 font-bold text-text">
                          {cert.title}
                        </td>

                        {/* Institute */}
                        <td className="py-4 px-6 font-medium text-text-light">
                          {cert.institute}
                        </td>

                        {/* Completion Date */}
                        <td className="py-4 px-6 text-text font-medium">
                          {formatDateDisplay(cert.date)}
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-6 text-text-light/80 text-[11px] font-medium">
                          {formatDateDisplay(cert.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(cert)}
                              className="p-2 text-text-light hover:text-primary hover:bg-secondary-light rounded-full transition-colors cursor-pointer"
                              title="Edit Certificate"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(cert)}
                              className="p-2 text-text-light hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Certificate"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredCertificates.map((cert) => {
                const imgUrl = cert.image || cert.imageUrl;

                return (
                  <div key={cert._id} className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-20 rounded-2xl overflow-hidden bg-background border border-border shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt={cert.title} className="h-full w-full object-cover" />
                        ) : (
                          <Award size={24} className="text-text-light/50" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-text truncate">{cert.title}</h3>
                        <p className="text-xs text-text-light font-medium">{cert.institute}</p>
                        <span className="text-[11px] text-text-light/80 block font-normal">
                          Completed: {formatDateDisplay(cert.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cert)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-text-light hover:text-primary p-1.5"
                      >
                        <Edit size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(cert)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1.5"
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
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
              <Award size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Certificates Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Add your professional beauty certificates to showcase your expertise.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add First Certificate</span>
            </button>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* ADD / EDIT CERTIFICATE MODAL */}
      {/* ====================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto opacity-100 z-10">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-white">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-text">
                  {editingCertId ? 'Edit Certificate' : 'Add Certificate'}
                </h2>
                <p className="text-xs text-text-light mt-0.5">
                  Enter certificate title, institute, completion date, and image.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-text-light hover:text-text hover:bg-secondary-light transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 bg-white">
              
              {/* Certificate Title */}
              <div className="space-y-1">
                <label htmlFor="cert-title" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Certificate Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="cert-title"
                  name="title"
                  placeholder="e.g. Master Class in Bridal HD Makeup"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.title ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-rose-500">{formErrors.title}</p>}
              </div>

              {/* Institute Name */}
              <div className="space-y-1">
                <label htmlFor="cert-institute" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Institute Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="cert-institute"
                  name="institute"
                  placeholder="e.g. International Beauty Academy, New Delhi"
                  value={formData.institute}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.institute ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.institute && <p className="text-[11px] text-rose-500">{formErrors.institute}</p>}
              </div>

              {/* Completion Date */}
              <div className="space-y-1">
                <label htmlFor="cert-date" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Completion Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  id="cert-date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors cursor-pointer ${
                    formErrors.date ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.date && <p className="text-[11px] text-rose-500">{formErrors.date}</p>}
              </div>

              {/* Certificate Image Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Certificate Image File <span className="text-rose-500">*</span>
                </label>

                <div className="relative border-2 border-dashed border-border hover:border-primary transition-colors rounded-2xl p-4 text-center cursor-pointer bg-background">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-text-light mb-1" size={20} />
                  <span className="block text-xs font-semibold text-text">
                    {fileInput ? fileInput.name : (editingCertId ? 'Click to Change Certificate Image' : 'Click to Upload Certificate Image File')}
                  </span>
                  <span className="block text-[10px] text-text-light mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                </div>
                {formErrors.image && <p className="text-[11px] text-rose-500">{formErrors.image}</p>}
              </div>

              {/* Image Preview Box */}
              {imagePreview && (
                <div className="p-3 border border-border rounded-2xl bg-background flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-14 w-20 rounded-xl object-cover border border-border shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="text-xs text-text-light">
                      <span className="font-semibold text-text block">Image Preview</span>
                      <span className="text-[11px]">Verify certificate photo.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFileInput(null);
                      setImagePreview('');
                      setFormData((prev) => ({ ...prev, image: '' }));
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-background border border-border hover:bg-secondary-light text-text px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingCertId ? 'Save' : 'Save'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ====================================================== */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white text-text border border-border rounded-3xl shadow-2xl p-6 space-y-6 text-center">
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl font-bold text-text">Delete Certificate?</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Are you sure you want to delete this certificate?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
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

    </main>
  );
};

export default ManageCertificates;
