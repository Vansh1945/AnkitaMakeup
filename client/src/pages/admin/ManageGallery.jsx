import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
  Search,
  RotateCcw,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Upload,
  Maximize2,
  FolderOpen,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';
import { getCategories } from '../../services/categoryApi';

const ManageGallery = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const dbCats = await getCategories(true);
      if (dbCats && dbCats.length > 0) {
        setCategories(dbCats.map((c) => c.name));
      }
    };
    loadCategories();
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Upload & Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bridal Makeup',
    description: '',
    imageUrl: '',
    isVisible: true
  });
  const [fileInput, setFileInput] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Large View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [itemToView, setItemToView] = useState(null);

  // Fetch Gallery Items from Backend API
  const fetchGallery = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.get('/admin/gallery');
      } catch (e) {
        try {
          response = await api.get('/api/admin/gallery');
        } catch (e2) {
          response = await api.get('/gallery');
        }
      }

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.items)) {
        dataList = response.items;
      }

      setItems(dataList);
    } catch (err) {
      console.error('Error loading gallery:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filter & Sort Items Computation
  const filteredItems = items
    .filter((item) => {
      if (!item) return false;

      // Title & Category Search
      const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || catMatch || descMatch;

      // Category Filter
      const matchesCategory =
        selectedCategory === 'All' ||
        (item.category || '').toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
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

  // Calculate Summary Statistics
  const totalImages = items.length;
  const totalCategories = new Set(
    items.map((i) => (i.category || 'Other').trim().toLowerCase())
  ).size;

  const latestUploadItem = items.length > 0
    ? [...items].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))[0]
    : null;

  const latestUploadDate = latestUploadItem
    ? new Date(latestUploadItem.createdAt || latestUploadItem.date || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'None';

  // Handle File Change with Live Object URL Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds maximum 5MB limit');
        return;
      }
      setFileInput(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      if (formErrors.imageUrl) {
        setFormErrors((prev) => ({ ...prev, imageUrl: '' }));
      }
    }
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('Newest');
  };

  // Open Upload Modal
  const handleOpenUploadModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Bridal Makeup',
      description: '',
      imageUrl: '',
      isVisible: true
    });
    setFileInput(null);
    setImagePreview('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const existingUrl = item.imageUrl || item.image || '';
    setFormData({
      title: item.title || '',
      category: item.category || 'Bridal Makeup',
      description: item.description || '',
      imageUrl: existingUrl,
      isVisible: item.isVisible !== false && item.visible !== false
    });
    setFileInput(null);
    setImagePreview(existingUrl);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Input Change Handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'imageUrl') {
      setImagePreview(value);
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Upload / Edit Form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Image Title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!editingItem && !fileInput) {
      errors.image = 'Please select an image file to upload';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Upload / Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('description', formData.description ? formData.description.trim() : '');
      payload.append('isVisible', formData.isVisible);

      if (fileInput) {
        payload.append('image', fileInput);
      } else if (editingItem) {
        const existingImg = formData.imageUrl || editingItem.image || editingItem.imageUrl || '';
        payload.append('imageUrl', existingImg);
        payload.append('image', existingImg);
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingItem) {
        try {
          await api.put(`/admin/gallery/${editingItem._id}`, payload, { headers });
        } catch (e) {
          await api.put(`/gallery/${editingItem._id}`, payload, { headers });
        }
        toast.success('Gallery Image Updated Successfully');
      } else {
        try {
          await api.post('/admin/gallery', payload, { headers });
        } catch (e) {
          await api.post('/gallery', payload, { headers });
        }
        toast.success('Gallery Image Uploaded Successfully');
      }

      setIsModalOpen(false);
      fetchGallery();
    } catch (err) {
      console.error('Error saving gallery image:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save image');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Handlers
  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      try {
        await api.delete(`/admin/gallery/${itemToDelete._id}`);
      } catch (e) {
        await api.delete(`/gallery/${itemToDelete._id}`);
      }
      toast.success('Gallery Image Deleted Successfully');
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchGallery();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  // Large View Modal Handler
  const handleOpenViewModal = (item) => {
    setItemToView(item);
    setViewModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently uploaded';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recently uploaded';
    }
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Manage Gallery | Admin Portal"
        description="Upload and manage portfolio images."
      />

      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Manage Gallery
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              Upload and manage portfolio images.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenUploadModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Plus size={16} />
            <span>Upload Images</span>
          </button>
        </div>

        {/* 3 Summary Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Total Images */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Total Images</span>
              <div className="font-playfair text-3xl font-bold text-text">{totalImages}</div>
              <span className="text-[11px] text-text-light font-medium">Portfolio gallery count</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-primary">
              <ImageIcon size={24} />
            </div>
          </div>

          {/* Card 2: Total Categories */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Total Categories</span>
              <div className="font-playfair text-3xl font-bold text-primary">{totalCategories}</div>
              <span className="text-[11px] text-text-light font-medium">Active image categories</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-primary">
              <FolderOpen size={24} />
            </div>
          </div>

          {/* Card 3: Latest Upload */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Latest Upload</span>
              <div className="font-playfair text-xl font-bold text-text truncate max-w-[150px]">
                {latestUploadItem ? latestUploadItem.title : 'None'}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">{latestUploadDate}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Clock size={24} />
            </div>
          </div>

        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-cat" className="text-xs font-semibold text-text-light shrink-0">Category:</label>
              <select
                id="filter-cat"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown & Reset */}
            <div className="flex items-center gap-2">
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
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

        {/* Gallery Cards Grid */}
        {loading ? (
          <Loading fullScreen={false} />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const imgUrl = item.imageUrl || item.image;

              return (
                <div
                  key={item._id}
                  className="group rounded-3xl bg-surface border border-border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-background border-b border-border overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-text-light/50">
                        <ImageIcon size={32} />
                      </div>
                    )}

                    {/* Category Overlay Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {item.category || 'Portfolio'}
                      </span>
                    </div>

                    {/* Quick Expand Button Overlay */}
                    <button
                      type="button"
                      onClick={() => handleOpenViewModal(item)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary cursor-pointer"
                      title="View Image"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-playfair text-lg font-bold text-text truncate">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-text-light font-medium block">
                        Uploaded: {formatDate(item.createdAt || item.date)}
                      </span>
                    </div>

                    {/* Action Bar: Delete Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-light hover:text-primary transition-colors cursor-pointer"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 transition-colors cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (

          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-border space-y-4 max-w-md mx-auto shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-light text-primary mx-auto">
              <ImageIcon size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Gallery Images Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Upload your first portfolio image.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Upload First Image</span>
            </button>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* UPLOAD / EDIT IMAGE MODAL */}
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
          <div className="relative w-full max-w-xl bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto opacity-100 z-10">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-white">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-text">
                  {editingItem ? 'Edit Gallery Image' : 'Upload Image'}
                </h2>
                <p className="text-xs text-text-light mt-0.5">
                  Select an image and enter details for portfolio display.
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
              
              {/* Image Title */}
              <div className="space-y-1">
                <label htmlFor="modal-title" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Image Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="modal-title"
                  name="title"
                  placeholder="e.g. Royal Bridal Glam Makeover"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.title ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-rose-500">{formErrors.title}</p>}
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label htmlFor="modal-category" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="modal-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image File Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Upload Image File <span className="text-rose-500">*</span>
                </label>

                {/* Dropzone File Upload */}
                <div className="relative border-2 border-dashed border-border hover:border-primary transition-colors rounded-2xl p-4 text-center cursor-pointer bg-background">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-text-light mb-1" size={20} />
                  <span className="block text-xs font-semibold text-text">
                    {fileInput ? fileInput.name : (editingItem ? 'Click to Change Image File' : 'Click to Upload Image File')}
                  </span>
                  <span className="block text-[10px] text-text-light mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                </div>
                {formErrors.image && <p className="text-[11px] text-rose-500">{formErrors.image}</p>}
              </div>

              {/* Live Image Preview */}
              {imagePreview && (
                <div className="p-3 border border-border rounded-2xl bg-background flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-text-light">
                    <span className="font-semibold text-text block">Image Preview</span>
                    <span className="text-[11px]">Verify photo display before uploading.</span>
                  </div>
                </div>
              )}

              {/* Description (Optional) */}
              <div className="space-y-1">
                <label htmlFor="modal-desc" className="block text-xs font-semibold uppercase tracking-wider text-text-light">
                  Short Description <span className="text-text-light font-normal">(Optional)</span>
                </label>
                <textarea
                  id="modal-desc"
                  name="description"
                  rows={2}
                  placeholder="Optional details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>

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
                  {submitting ? 'Uploading...' : editingItem ? 'Save Changes' : 'Upload'}
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
              <h3 className="font-playfair text-2xl font-bold text-text">Delete Image?</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Are you sure you want to delete this image?
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

      {/* ====================================================== */}
      {/* LARGE IMAGE PREVIEW VIEW MODAL */}
      {/* ====================================================== */}
      {viewModalOpen && itemToView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-white">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary-light border border-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {itemToView.category || 'Portfolio'}
                </span>
                <h3 className="font-playfair text-xl font-bold text-text truncate">
                  {itemToView.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-full p-2 text-text-light hover:text-text hover:bg-secondary-light transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-6 overflow-y-auto space-y-4 bg-white text-center">
              <div className="rounded-2xl border border-border overflow-hidden bg-background max-h-[55vh] flex items-center justify-center">
                <img
                  src={itemToView.imageUrl || itemToView.image}
                  alt={itemToView.title}
                  className="max-h-[55vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>

              {itemToView.description && (
                <p className="text-xs text-text-light leading-relaxed max-w-xl mx-auto text-left">
                  {itemToView.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-text-light border-t border-border/60 pt-3 font-medium">
                <span>Uploaded: {formatDate(itemToView.createdAt || itemToView.date)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
};

export default ManageGallery;
