import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Heart,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  User,
  Phone,
  Plus,
  X,
  Send
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { getApprovedReviews, getReviewStats, submitReview } from '../services/reviewApi';
import { getServices } from '../services/serviceApi';
import { getCategories } from '../services/categoryApi';
import { toast } from 'react-toastify';

const BASE_FILTER_OPTIONS = [
  { id: 'all', label: 'All Reviews' },
  { id: '5star', label: '5 Star' },
  { id: '4star', label: '4 Star' },
  { id: '3star', label: '3 Star' },
];

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState(BASE_FILTER_OPTIONS);

  // Filter, Search, Sort & Pagination states
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [visibleCount, setVisibleCount] = useState(6);
  const [helpfulState, setHelpfulState] = useState({});

  const [dbCategoryOptions, setDbCategoryOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    serviceName: 'Bridal Makeup',
    rating: 5,
    phone: '',
    email: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, statsData, dbCats] = await Promise.all([
        getApprovedReviews(),
        getReviewStats(),
        getCategories()
      ]);
      setReviews(reviewsData || []);
      if (statsData) setBackendStats(statsData);
      if (dbCats && dbCats.length > 0) {
        const catNames = dbCats.map((c) => c.name);
        setDbCategoryOptions(catNames);
        setNewReview((prev) => ({
          ...prev,
          serviceName: catNames[0] || 'Bridal Makeup'
        }));

        const uniqueCatOptions = dbCats
          .map((c, idx) => ({
            id: c.slug || c._id || `cat-${idx}`,
            label: c.name
          }))
          .filter((opt) => !BASE_FILTER_OPTIONS.some((b) => b.id === opt.id));

        setFilterOptions([...BASE_FILTER_OPTIONS, ...uniqueCatOptions]);
      }
    } catch (err) {
      console.error('Failed to load client reviews:', err);
      setError('Unable to load client reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // Handle Client Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      toast.error('Please enter your name and review comment');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        name: newReview.name.trim(),
        serviceName: newReview.serviceName,
        rating: Number(newReview.rating),
        phone: newReview.phone.trim(),
        email: newReview.email.trim(),
        comment: newReview.comment.trim(),
        review: newReview.comment.trim()
      });
      toast.success('Thank you! Your review has been submitted for admin approval.');
      setNewReview({
        name: '',
        serviceName: 'Bridal HD Makeup',
        rating: 5,
        phone: '',
        email: '',
        comment: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamically calculate statistics strictly from the live reviews array
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        avgRating: '0.0',
        total: 0,
        fiveStarPct: 0,
        repeatClientPct: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const total = reviews.length;
    const sumRating = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    const avgRating = (sumRating / total).toFixed(1);

    const fiveStarsCount = reviews.filter((r) => Number(r.rating) === 5).length;
    const fiveStarPct = Math.round((fiveStarsCount / total) * 100);

    const breakdownCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rat = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      breakdownCounts[rat] = (breakdownCounts[rat] || 0) + 1;
    });

    const breakdown = {
      5: Math.round(((breakdownCounts[5] || 0) / total) * 100),
      4: Math.round(((breakdownCounts[4] || 0) / total) * 100),
      3: Math.round(((breakdownCounts[3] || 0) / total) * 100),
      2: Math.round(((breakdownCounts[2] || 0) / total) * 100),
      1: Math.round(((breakdownCounts[1] || 0) / total) * 100)
    };

    // Calculate repeat client percentage based on repeat client names / emails / phones
    const clientIdentifiers = {};
    reviews.forEach((r) => {
      const id = (r.name || r.clientName || r.email || r.phone || '').trim().toLowerCase();
      if (id) clientIdentifiers[id] = (clientIdentifiers[id] || 0) + 1;
    });

    const uniqueClientsCount = Object.keys(clientIdentifiers).length;
    const repeatClientsCount = Object.values(clientIdentifiers).filter((cnt) => cnt > 1).length;
    const repeatClientPct = uniqueClientsCount > 0 ? Math.round((repeatClientsCount / uniqueClientsCount) * 100) : 0;

    return {
      avgRating,
      total,
      fiveStarPct,
      repeatClientPct,
      breakdown
    };
  }, [reviews]);

  // Filter & Search Logic
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];

    // Filter by Rating / Category
    if (activeFilter === '5star') {
      list = list.filter((r) => Number(r.rating) === 5);
    } else if (activeFilter === '4star') {
      list = list.filter((r) => Number(r.rating) === 4);
    } else if (activeFilter === '3star') {
      list = list.filter((r) => Number(r.rating) === 3);
    } else if (activeFilter === 'bridal') {
      list = list.filter((r) =>
        (r.serviceName || r.category || '').toLowerCase().includes('bridal')
      );
    } else if (activeFilter === 'party') {
      list = list.filter((r) =>
        (r.serviceName || r.category || '').toLowerCase().includes('party')
      );
    } else if (activeFilter === 'engagement') {
      list = list.filter((r) =>
        (r.serviceName || r.category || '').toLowerCase().includes('engagement')
      );
    } else if (activeFilter === 'hd') {
      list = list.filter((r) =>
        (r.serviceName || r.category || r.comment || r.review || '').toLowerCase().includes('hd')
      );
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const name = (r.name || r.clientName || '').toLowerCase();
        const comment = (r.comment || r.review || '').toLowerCase();
        const service = (r.serviceName || r.category || '').toLowerCase();
        return name.includes(query) || comment.includes(query) || service.includes(query);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'highest') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === 'lowest') return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    return list;
  }, [reviews, activeFilter, searchQuery, sortBy]);

  // Handle Helpful Upvote Toggle
  const handleHelpfulClick = (reviewId) => {
    setHelpfulState((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  const visibleReviews = filteredAndSortedReviews.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title="Client Reviews | Makeup Studio"
        description="Read genuine experiences shared by our happy clients after their makeup appointments."
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-12 sm:space-y-16">

        {/* 1. Page Header (Hero Section) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-secondary-light/40 to-surface border border-border p-8 sm:p-14 text-center space-y-5 shadow-xs">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            <span>Verified Customer Stories</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Client Reviews
          </h1>

          <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-2xl mx-auto">
            Read genuine experiences shared by our happy clients after their makeup appointments.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-7 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Write a Review</span>
            </button>
          </div>
        </section>

        {/* 2. Review Statistics Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-amber-400 mb-1">
              <Star size={24} className="fill-current" />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {stats.avgRating}
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Average Rating
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-primary mb-1">
              <Heart size={24} className="fill-current text-primary" />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {stats.total}+
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Total Reviews
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-amber-400 mb-1">
              <Star size={24} className="fill-current" />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {stats.fiveStarPct}%
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Five Star Reviews
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-emerald-600 mb-1">
              <RotateCcw size={24} />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {stats.repeatClientPct}%
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Repeat Clients
            </div>
          </div>
        </section>

        {/* 3. Rating Summary Breakdown */}
        <section className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 text-center md:border-r border-border md:pr-8 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Rating Summary</span>
              <div className="font-playfair text-5xl font-black text-text">{stats.avgRating}</div>
              <div className="flex justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-current" />
                ))}
              </div>
              <p className="text-xs text-text-light font-medium pt-1">
                Based on {stats.total} verified client reviews
              </p>
            </div>

            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const pct = stats.breakdown[starNum] || 0;
                return (
                  <div key={starNum} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-medium text-text flex items-center gap-1">
                      {starNum} <Star size={12} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-background overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-semibold text-text-light">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Controls: Filter Chips, Search Input & Sort Dropdown */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {filterOptions.map((opt, idx) => {
                const isActive = activeFilter === opt.id;
                return (
                  <button
                    key={opt.id || `filter-${idx}`}
                    onClick={() => setActiveFilter(opt.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface border border-border text-text-light hover:text-text hover:bg-secondary-light/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Input */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs font-medium text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

          </div>

          {/* 5. Reviews Display Grid / Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="animate-pulse p-6 rounded-2xl bg-surface border border-border space-y-4"
                >
                  <div className="h-4 bg-border/60 rounded-full w-1/3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-border/40 rounded-full w-full" />
                    <div className="h-3 bg-border/40 rounded-full w-5/6" />
                    <div className="h-3 bg-border/40 rounded-full w-2/3" />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <div className="h-10 w-10 rounded-full bg-border/60 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-3 bg-border/60 rounded-full w-1/2" />
                      <div className="h-2 bg-border/40 rounded-full w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-border space-y-4 max-w-md mx-auto shadow-xs">
              <AlertCircle size={36} className="text-rose-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-playfair text-lg font-bold text-text">Error Loading Reviews</h3>
                <p className="text-xs text-text-light">{error}</p>
              </div>
              <button
                onClick={fetchPageData}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-border space-y-4 max-w-md mx-auto shadow-xs">
              <MessageSquare size={36} className="text-text-light mx-auto" />
              <div className="space-y-1">
                <h3 className="font-playfair text-lg font-bold text-text">No Reviews Found</h3>
                <p className="text-xs text-text-light">
                  {searchQuery || activeFilter !== 'all'
                    ? 'No reviews match your current filter or search criteria.'
                    : 'Be the first client to share your makeover experience!'}
                </p>
              </div>
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleReviews.map((rev, index) => {
                const reviewId = rev._id || rev.id || index;
                const clientName = rev.customerName || rev.name || rev.clientName || 'Client';
                const rating = Number(rev.rating) || 5;
                const serviceName = rev.serviceName || rev.category || '';
                const commentText = rev.review || rev.comment || rev.description || '';
                const locationStr = rev.location || rev.city || '';
                const clientPhoto = rev.image || rev.photo || rev.avatar;
                const currentHelpful = (rev.helpfulCount || 0) + (helpfulState[reviewId] || 0);

                return (
                  <article
                    key={reviewId}
                    className="group rounded-3xl bg-surface border border-border p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      
                      {/* Header: Rating & Verified Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-border fill-transparent'
                              }
                            />
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Client Header Info */}
                      <div className="flex items-center gap-3">
                        {clientPhoto ? (
                          <img
                            src={clientPhoto}
                            alt={clientName}
                            className="h-11 w-11 rounded-full object-cover border border-primary/30 shrink-0"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-secondary-light border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {clientName[0].toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="font-playfair text-base font-bold text-text truncate">
                            {clientName}
                          </h4>
                          {(serviceName || locationStr) && (
                            <div className="flex items-center gap-2 text-[11px] text-text-light font-medium truncate">
                              {serviceName && <span className="text-primary font-semibold truncate">{serviceName}</span>}
                              {serviceName && locationStr && <span>•</span>}
                              {locationStr && <span>{locationStr}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Comment Text */}
                      <p className="text-xs text-text-light leading-relaxed font-light italic border-l-2 border-primary/40 pl-3 py-1">
                        "{commentText}"
                      </p>

                      {/* Service Date if available */}
                      {rev.createdAt && (
                        <div className="flex items-center gap-1.5 text-[11px] text-text-light font-medium pt-1">
                          <Calendar size={12} className="text-primary shrink-0" />
                          <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                      <button
                        onClick={() => handleHelpfulClick(reviewId)}
                        className="inline-flex items-center gap-1.5 text-xs text-text-light hover:text-primary transition-colors font-medium"
                        aria-label={`Mark review by ${clientName} as helpful`}
                      >
                        <Heart size={14} className="fill-primary text-primary" />
                        <span>Helpful ({currentHelpful})</span>
                      </button>

                      <span className="text-[10px] uppercase tracking-wider text-text-light font-semibold">
                        {rating === 5 ? '5.0 Five Star' : `${rating}.0 Rating`}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* 6. Pagination / Load More Button */}
          {!loading && !error && visibleCount < filteredAndSortedReviews.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-xs hover:scale-105 transition-all duration-300"
              >
                <span>Load More Reviews</span>
              </button>
            </div>
          )}

        </section>

      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-playfair text-xl font-bold text-text">Write a Review</h3>
                <p className="text-xs text-text-light mt-0.5 font-medium">
                  Share your experience with our makeup studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-text-light hover:bg-secondary-light hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newReview.name}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text">Service Received</label>
                  <select
                    value={newReview.serviceName}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, serviceName: e.target.value }))}
                    className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {dbCategoryOptions.length > 0 ? (
                      dbCategoryOptions.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Bridal Makeup">Bridal Makeup</option>
                        <option value="Party Makeup">Party Makeup</option>
                        <option value="Engagement Makeup">Engagement Makeup</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text">Rating *</label>
                  <div className="flex items-center gap-1 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          className={
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-border fill-transparent'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text">Phone / Email (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210 or email"
                  value={newReview.phone}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl bg-white border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text">Your Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details of your makeover experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full rounded-2xl bg-white border border-border p-4 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

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
                  className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-7 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ReviewsPage;
