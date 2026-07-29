import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Image as ImageIcon,
  Search,
  Filter,
  ArrowUpDown,
  X,
  AlertTriangle,
  Clock,
  Tag,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';
import { getCategories } from '../../services/categoryApi';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const dbCats = await getCategories(true);
      if (dbCats && dbCats.length > 0) {
        setCategories(['All', ...dbCats.map((c) => c.name)]);
      }
    };
    loadCategories();
  }, []);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bridal',
    description: '',
    price: '',
    duration: '',
    coverImage: '',
    active: true,
    featured: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Services List from Backend API
  const fetchServices = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.get('/services?all=true');
      } catch (e) {
        response = await api.get('/api/services?all=true');
      }

      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response && Array.isArray(response.services)) {
        dataList = response.services;
      }

      setServices(dataList);
    } catch (err) {
      console.error('Error fetching services:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Something Went Wrong while fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter & Sort Computation
  const filteredServices = services
    .filter((service) => {
      if (!service) return false;
      const titleMatch = (service.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (service.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || catMatch || descMatch;

      // Status Filter
      const isActive = service.active !== false;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && isActive) ||
        (selectedStatus === 'Inactive' && !isActive);

      // Category Filter
      const matchesCategory =
        selectedCategory === 'All' ||
        (service.category || '').toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
      if (sortBy === 'Oldest') {
        return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
      }
      if (sortBy === 'Price Low-High') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === 'Price High-Low') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      return 0;
    });

  // Calculate Statistics
  const totalServices = services.length;
  const activeServices = services.filter((s) => s && s.active !== false).length;
  const inactiveServices = totalServices - activeServices;

  // Toggle Active Status
  const handleToggleStatus = async (service) => {
    const newStatus = !(service.active !== false);
    try {
      let response;
      try {
        response = await api.patch(`/services/${service._id}/status`, { active: newStatus });
      } catch (e) {
        response = await api.put(`/services/${service._id}`, { ...service, active: newStatus });
      }

      toast.success(newStatus ? 'Service Activated Successfully' : 'Service Deactivated Successfully');
      fetchServices();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update service status');
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormData({
      title: '',
      category: 'Bridal',
      description: '',
      price: '',
      duration: '120 Mins',
      coverImage: '',
      active: true,
      featured: false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      title: service.title || '',
      category: service.category || 'Bridal',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      coverImage: service.coverImage || service.image || '',
      active: service.active !== false,
      featured: !!service.featured
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Modal Input Change Handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Add/Edit Form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Service Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!formData.duration.toString().trim()) {
      errors.duration = 'Duration is required';
    }

    if (!formData.coverImage.trim()) {
      errors.coverImage = 'Image URL or Upload is required';
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
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        duration: formData.duration,
        coverImage: formData.coverImage.trim(),
        active: formData.active,
        featured: formData.featured
      };

      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
        toast.success('Service Updated Successfully');
      } else {
        await api.post('/services', payload);
        toast.success('Service Added Successfully');
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Something Went Wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Handler
  const handleOpenDeleteModal = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${serviceToDelete._id}`);
      toast.success('Service Deleted Successfully');
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-12">
      <SEO
        title="Manage Services | Admin Portal"
        description="Add, edit, and manage all makeup and hairstyling services from one place."
      />

      <div className="space-y-8">
        
        {/* Page Title & Add Service Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Manage Services
            </h1>
            <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
              Add, edit and manage all makeup services from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>

        {/* Top Statistics Cards (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Total Services */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Total Services</span>
              <div className="font-playfair text-3xl font-bold text-text">{totalServices}</div>
              <span className="text-[11px] text-text-light font-medium">All configured services</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-primary">
              <Sparkles size={24} />
            </div>
          </div>

          {/* Card 2: Active Services */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Active Services</span>
              <div className="font-playfair text-3xl font-bold text-emerald-600">{activeServices}</div>
              <span className="text-[11px] text-emerald-600/80 font-medium">Visible to customers</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* Card 3: Inactive Services */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Inactive Services</span>
              <div className="font-playfair text-3xl font-bold text-text-light">{inactiveServices}</div>
              <span className="text-[11px] text-text-light font-medium">Hidden from website</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-text-light border border-border">
              <XCircle size={24} />
            </div>
          </div>

        </div>

        {/* Search & Filters Toolbar */}
        <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search service name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-xs font-semibold text-text-light shrink-0">Status:</label>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-category" className="text-xs font-semibold text-text-light shrink-0">Category:</label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-xs font-semibold text-text-light shrink-0">Sort:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Price Low-High">Price: Low to High</option>
                <option value="Price High-Low">Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* Content Section: Table (Desktop) / Cards (Mobile) */}
        {loading ? (
          <Loading fullScreen={false} />
        ) : filteredServices.length > 0 ? (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-bold uppercase tracking-wider text-text-light bg-background/50">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Service Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredServices.map((service) => {
                    const isActive = service.active !== false;
                    const imgUrl = service.coverImage || service.image;

                    return (
                      <tr key={service._id} className="hover:bg-secondary-light/20 transition-colors">
                        
                        {/* Service Thumbnail Image */}
                        <td className="py-4 px-6">
                          <div className="h-12 w-12 rounded-2xl overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={service.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon size={20} className="text-text-light/50" />
                            )}
                          </div>
                        </td>

                        {/* Title & Description Truncated to 80 Chars */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-bold text-text block">{service.title}</span>
                            <span className="text-[11px] text-text-light font-normal block max-w-xs truncate">
                              {service.description ? (
                                service.description.length > 80
                                  ? `${service.description.substring(0, 80)}...`
                                  : service.description
                              ) : (
                                'No description provided'
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 font-semibold uppercase tracking-wider text-text-light text-[11px]">
                          {service.category || 'General'}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-bold text-text">
                          {formatPrice(service.price)}
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-6 text-text-light font-medium">
                          {service.duration || 'N/A'}
                        </td>

                        {/* Status Toggle Badge */}
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-transform hover:scale-105 ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border-gray-300'
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>{isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Featured Service Status */}
                        <td className="py-4 px-6 text-center">
                          {service.featured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-text-light/50 font-normal">—</span>
                          )}
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(service)}
                              className="p-2 text-text-light hover:text-primary hover:bg-secondary-light rounded-full transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(service)}
                              className="p-2 text-text-light hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Service"
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

            {/* Mobile Card Layout */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredServices.map((service) => {
                const isActive = service.active !== false;
                const imgUrl = service.coverImage || service.image;

                return (
                  <div key={service._id} className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-background border border-border shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt={service.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={24} className="text-text-light/50" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary-light text-primary border border-secondary px-2 py-0.5 rounded-md">
                            {service.category}
                          </span>
                          {service.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-text truncate">{service.title}</h3>
                        <p className="text-xs text-text-light line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                      <div>
                        <span className="font-bold text-text block">{formatPrice(service.price)}</span>
                        <span className="text-[11px] text-text-light">{service.duration}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(service)}
                            className="p-1.5 text-text-light hover:text-primary rounded-full"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(service)}
                            className="p-1.5 text-text-light hover:text-rose-600 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-text">No Services Found</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'No makeup services match your current filter criteria.'
                  : 'Start building your service menu by adding your first service.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add First Service</span>
            </button>
          </div>

        )}

      </div>

      {/* ====================================================== */}
      {/* ADD / EDIT SERVICE MODAL */}
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
          <div className="relative w-full max-w-2xl bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto opacity-100 z-10">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-white">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-text">
                  {editingServiceId ? 'Edit Makeup Service' : 'Add New Makeup Service'}
                </h2>
                <p className="text-xs text-text-light mt-0.5">
                  Fill details below to update your service offerings.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-text-light hover:text-text hover:bg-secondary-light transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 bg-white">
              
              {/* Service Title */}
              <div className="space-y-1">
                <label htmlFor="service-title" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="service-title"
                  name="title"
                  placeholder="e.g. Bridal HD Makeover & Hair Styling"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.title ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-rose-500">{formErrors.title}</p>}
              </div>

              {/* Category & Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div className="space-y-1">
                  <label htmlFor="service-category" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="service-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label htmlFor="service-price" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="service-price"
                    name="price"
                    placeholder="e.g. 15000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      formErrors.price ? 'border-rose-400' : 'border-border'
                    }`}
                  />
                  {formErrors.price && <p className="text-[11px] text-rose-500">{formErrors.price}</p>}
                </div>

              </div>

              {/* Duration & Image URL Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Duration */}
                <div className="space-y-1">
                  <label htmlFor="service-duration" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Duration <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="service-duration"
                    name="duration"
                    placeholder="e.g. 120 Mins or 2.5 Hours"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      formErrors.duration ? 'border-rose-400' : 'border-border'
                    }`}
                  />
                  {formErrors.duration && <p className="text-[11px] text-rose-500">{formErrors.duration}</p>}
                </div>

                {/* Image URL / Upload */}
                <div className="space-y-1">
                  <label htmlFor="service-image" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Image URL / Path <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="service-image"
                    name="coverImage"
                    placeholder="https://... image link"
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      formErrors.coverImage ? 'border-rose-400' : 'border-border'
                    }`}
                  />
                  {formErrors.coverImage && <p className="text-[11px] text-rose-500">{formErrors.coverImage}</p>}
                </div>

              </div>

              {/* Image Preview Box */}
              {formData.coverImage && (
                <div className="p-3 border border-border rounded-2xl bg-background flex items-center gap-4">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="h-14 w-14 rounded-xl object-cover border border-border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-text-light">
                    <span className="font-semibold text-text block">Image Preview</span>
                    <span className="text-[11px]">Verify image thumbnail appearance.</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="service-description" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Description <span className="text-rose-500">* (Min 20 characters)</span>
                </label>
                <textarea
                  id="service-description"
                  name="description"
                  rows={3}
                  placeholder="Detailed description of makeup techniques, included styling, and products used..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.description ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.description && <p className="text-[11px] text-rose-500">{formErrors.description}</p>}
              </div>

              {/* Switches: Active Status & Featured */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
                
                {/* Active Status */}
                <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                  />
                  <span>Active Service (Visible to Public)</span>
                </label>

                {/* Featured */}
                <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                  />
                  <span>Featured Service (Homepage Showcase)</span>
                </label>

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
                  {submitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Save Service'}
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
              <h3 className="font-playfair text-2xl font-bold text-text">Delete Service?</h3>
              <p className="text-xs text-text-light leading-relaxed">
                Are you sure you want to delete <strong className="text-text">"{serviceToDelete?.title}"</strong>? This action cannot be undone.
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

export default ManageServices;
