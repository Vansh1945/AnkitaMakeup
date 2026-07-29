import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Tag, ArrowLeft, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import SEO from '../components/common/SEO';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { toast } from 'react-toastify';

const ServiceDetail = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/services/${idOrSlug}`);
        if (response.success) {
          setService(response.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load service details');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [idOrSlug, navigate]);

  // Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 md:py-20 bg-[#fbf9f7]">
        <div className="mx-auto max-w-[96%] px-2 sm:px-4 lg:px-6">
          <SkeletonLoader type="detail" />
        </div>
      </main>
    );
  }

  if (!service) return null;

  return (
    <main className="min-h-screen py-12 md:py-20 bg-[#fbf9f7]">
      <SEO
        title={service.title}
        description={service.description.substring(0, 150)}
        ogImage={service.coverImage}
      />
      <div className="mx-auto max-w-[96%] px-2 sm:px-4 lg:px-6">
        
        {/* Back Link */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-dark-500 hover:text-primary-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Services</span>
        </Link>

        {/* Details Grid */}
        <div className="grid gap-12 lg:grid-cols-12 items-start bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-dark-100">
          
          {/* Left: Image Container */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3] md:aspect-square bg-dark-100 shadow-md">
            <img
              src={service.coverImage || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop'}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Info and Pricing */}
          <div className="lg:col-span-6 flex flex-col h-full justify-between">
            <div>
              {/* Category and Tags */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-primary-600">
                  <Tag size={12} />
                  {service.category}
                </span>
                {service.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full gold-gradient px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                    <Sparkles size={10} />
                    <span>Featured</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-dark-900 font-playfair mb-6">
                {service.title}
              </h1>

              {/* Specs */}
              <div className="flex flex-wrap gap-6 mb-8 py-4 border-y border-dark-100">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-1">Duration</span>
                  <div className="flex items-center gap-1.5 text-dark-700 font-medium font-sans">
                    <Clock size={16} className="text-primary-500" />
                    <span>{service.duration} Minutes</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-1">Rate</span>
                  <span className="text-2xl font-bold text-dark-900 font-sans">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-dark-800 font-semibold mb-3">Service Details</h3>
                <p className="font-sans text-base text-dark-600 font-light leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-auto bg-dark-50 rounded-2xl p-6 border border-dark-100">
              <div className="flex items-start gap-3 mb-6">
                <ShieldCheck className="text-primary-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="font-sans text-xs text-dark-500 leading-relaxed font-light">
                  Professional hygiene standards maintained. Product consultation and minor skin preparation are included in the listed session duration.
                </p>
              </div>

              <Link
                to="/contact"
                className="rose-gradient w-full inline-flex items-center justify-center gap-2 rounded-full py-4 font-sans text-sm font-semibold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Mail size={16} />
                <span>Enquire Now</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};

export default ServiceDetail;
