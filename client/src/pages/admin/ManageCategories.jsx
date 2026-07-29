import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
  Save,
  X,
  LayoutGrid,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryApi';

const emptyForm = { name: '', description: '', active: true, sortOrder: '' };

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories(true); // fetch all including inactive
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      active: cat.active !== false,
      sortOrder: cat.sortOrder != null ? String(cat.sortOrder) : ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Category name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        active: formData.active,
        sortOrder: formData.sortOrder !== '' ? Number(formData.sortOrder) : 0
      };
      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
        toast.success('Category updated successfully!');
      } else {
        await createCategory(payload);
        toast.success('Category added successfully!');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteCategory(id);
      toast.success('Category deleted.');
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await updateCategory(cat._id, { active: !cat.active });
      toast.success(`Category ${!cat.active ? 'enabled' : 'disabled'}.`);
      fetchCategories();
    } catch {
      toast.error('Failed to update category status.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <SEO title="Manage Categories | Admin" description="Add, edit, or delete makeup service categories." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <LayoutGrid size={14} />
              <span>Category Management</span>
            </div>
            <h1 className="font-playfair text-3xl font-bold text-text">Manage Categories</h1>
            <p className="text-xs text-text-light">
              All categories here appear in Gallery, Services, and Booking filters automatically.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              className="inline-flex items-center gap-2 rounded-2xl bg-surface border border-border hover:bg-secondary-light text-text px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-surface border border-border p-4 text-center">
            <div className="font-playfair text-2xl font-bold text-primary">{categories.length}</div>
            <div className="text-[11px] text-text-light font-medium mt-1">Total Categories</div>
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 text-center">
            <div className="font-playfair text-2xl font-bold text-emerald-600">
              {categories.filter((c) => c.active).length}
            </div>
            <div className="text-[11px] text-text-light font-medium mt-1">Active</div>
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 text-center col-span-2 sm:col-span-1">
            <div className="font-playfair text-2xl font-bold text-rose-500">
              {categories.filter((c) => !c.active).length}
            </div>
            <div className="text-[11px] text-text-light font-medium mt-1">Inactive</div>
          </div>
        </div>

        {/* Loading */}
        {loading && <Loading />}

        {/* Categories Table */}
        {!loading && categories.length === 0 && (
          <div className="rounded-3xl bg-surface border border-border p-10 text-center space-y-3">
            <Tag size={32} className="text-primary mx-auto" />
            <h3 className="font-playfair text-xl font-bold text-text">No Categories Yet</h3>
            <p className="text-xs text-text-light">Add your first category to get started.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-dark transition-colors"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-background/60">
                    <th className="px-5 py-3.5 text-left font-semibold text-text-light uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-text-light uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-text-light uppercase tracking-wider hidden sm:table-cell">Description</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-text-light uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-text-light uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr
                      key={cat._id}
                      className="border-b border-border/60 hover:bg-background/40 transition-colors"
                    >
                      <td className="px-5 py-4 text-text-light font-medium">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-xl bg-secondary-light border border-secondary flex items-center justify-center shrink-0">
                            <Tag size={13} className="text-primary" />
                          </div>
                          <span className="font-semibold text-text">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-light hidden sm:table-cell max-w-xs truncate">
                        {cat.description || <span className="italic text-border">No description</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          title={cat.active ? 'Click to disable' : 'Click to enable'}
                          className="cursor-pointer"
                        >
                          {cat.active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 font-semibold text-[11px]">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-1 font-semibold text-[11px]">
                              <XCircle size={12} />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="h-8 w-8 rounded-xl bg-background hover:bg-secondary-light border border-border flex items-center justify-center text-text-light hover:text-primary transition-colors cursor-pointer"
                            title="Edit category"
                          >
                            <Pencil size={13} />
                          </button>
                          {deletingId === cat._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(cat._id)}
                                disabled={saving}
                                className="h-8 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="h-8 w-8 rounded-xl bg-surface border border-border flex items-center justify-center text-text-light cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(cat._id)}
                              className="h-8 w-8 rounded-xl bg-background hover:bg-rose-50 border border-border flex items-center justify-center text-text-light hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete category"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-border shadow-xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-xl font-bold text-text">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={closeModal}
                className="h-9 w-9 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-light hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Bridal Makeup"
                  className={`w-full rounded-2xl bg-background border px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors ${
                    formErrors.name ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description (optional)"
                  className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData((p) => ({ ...p, sortOrder: e.target.value }))}
                  placeholder="e.g. 1 (lower = shown first)"
                  className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-background border border-border px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-text">Active Status</p>
                  <p className="text-[11px] text-text-light">Inactive categories are hidden from public filters.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, active: !p.active }))}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer ${
                    formData.active ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      formData.active ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl bg-surface border border-border hover:bg-secondary-light text-text px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-dark text-white px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
