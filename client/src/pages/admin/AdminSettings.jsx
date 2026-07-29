import React, { useState, useEffect } from 'react';
import {
  Globe,
  ImageIcon,
  Layout,
  UserCheck,
  PhoneCall,
  Share2,
  Search,
  Save,
  RotateCcw,
  Upload,
  X,
  Trash2,
  Check,
  Sparkles,
  Info,
  User,
  Key,
  Lock,
  Mail,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SEO from '../../components/common/SEO';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({});

  // ─────────────────────────────────────────────────────────────────────────────
  // Central Form State for Website Settings (Merged & Streamlined)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    websiteName: 'Ankita Makeup',
    businessName: 'Ankita Makeup Studio',
    ownerName: 'Ankita',
    tagline: 'Professional Makeup & Hair Duo',
    businessTiming: '09:00 AM - 08:00 PM',
    yearsOfExperience: '7+',
    workingSince: '2017',
    shortDescription: 'Certified luxury makeup artist and hairstylist based in New Delhi.',
    fullAboutDescription: '',

    // Section 2: Branding & Media
    logo: '',
    favicon: '',
    heroBannerImage: '',
    aboutImage: '',

    // Section 3: Hero Section
    heroTitle: 'Beautiful Makeup For Your Special Day',
    heroSubtitle: 'Professional Bridal & Fashion Makeup Artist',
    heroDescription: 'Beautiful makeup and hairstyles for brides, photo shoots, and special events. Based in Delhi.',
    heroButtonText: 'Book Appointment',
    heroButtonLink: '/booking',
    heroSecondaryButtonText: 'Explore Portfolio',
    heroSecondaryButtonLink: '/portfolio',
    heroOverlayOpacity: '0.4',

    // Section 4: About Section
    aboutTitle: 'My Story & Philosophy',
    aboutSubtitle: 'Dedicated to Timeless Elegance',
    aboutShortDescription: 'I believe that makeup should make you feel confident, not hide your face.',
    happyClientsCount: '500+',
    completedMakeovers: '800+',
    bridalMakeoversCount: '10+',
    certificationsCount: '15+',
    ctaText: 'Book Your Session',
    ctaLink: '/contact',

    // Section 5: Contact Details
    phone: '+91 98765 43210',
    altPhone: '',
    whatsapp: '+91 98765 43210',
    whatsappDefaultMessage: 'Hello! I would like to inquire about booking a makeup appointment.',
    email: 'ankitamakeup@gmail.com',
    address: 'New Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110001',

    // Section 6: Social Links
    facebook: 'https://facebook.com',
    facebookEnabled: true,
    instagram: 'https://instagram.com',
    instagramEnabled: true,
    youtube: 'https://youtube.com',
    youtubeEnabled: true,
    pinterest: 'https://pinterest.com',
    pinterestEnabled: true,

    // Section 7: SEO Settings
    metaTitle: 'Ankita Makeup | Professional Makeup Artist',
    metaDescription: 'Explore professional makeup artist portfolio by Ankita in Delhi.',
    metaKeywords: 'makeup artist, delhi, bridal makeup, hairstyling',
    canonicalUrl: 'https://ankitamakeup.vercel.app',
    googleAnalyticsId: '',
    googleSearchConsoleVerification: '',
    robotsMeta: 'index, follow',
    author: 'Ankita'
  });

  // Account Tab States
  const [profileData, setProfileData] = useState({
    username: user?.username || 'admin',
    email: user?.email || 'admin@ankitamakeup.com'
  });

  const [sharedCurrentPassword, setSharedCurrentPassword] = useState('');

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [pinData, setPinData] = useState({
    newPin: '',
    confirmPin: ''
  });

  // Image File Upload State & Local Previews
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  // Fetch Website Settings from Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/website-settings');
        const data = res.data || res.settings || res;
        if (data && typeof data === 'object') {
          setFormData((prev) => ({ ...prev, ...data }));
          setInitialData(data);

          // Populate image previews
          setPreviews({
            logo: data.logo || '',
            favicon: data.favicon || '',
            heroBannerImage: data.heroBannerImage || '',
            aboutImage: data.aboutImage || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        toast.error('Could not load website settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update profile input from auth user
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || 'admin',
        email: user.email || ''
      });
    }
  }, [user]);

  // Input Change Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setPreviews((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleRemoveMedia = (fieldName) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    setPreviews((prev) => ({ ...prev, [fieldName]: '' }));
    setFormData((prev) => ({ ...prev, [fieldName]: '' }));
  };

  // Reset to initial settings
  const handleReset = () => {
    setFormData(initialData);
    setFiles({});
    setPreviews({
      logo: initialData.logo || '',
      favicon: initialData.favicon || '',
      heroBannerImage: initialData.heroBannerImage || '',
      aboutImage: initialData.aboutImage || ''
    });
    toast.info('Form reset to saved values');
  };

  // Save Website Settings (PUT /api/v1/website-settings)
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const submitData = new FormData();

      // Append text & boolean fields
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key] === null || formData[key] === undefined ? '' : formData[key]);
      });

      // Append updated file uploads (overrides text field in multer)
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      const res = await api.put('/website-settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success || res.data) {
        toast.success(res.message || 'Website Settings updated successfully!');
        const updated = res.data || res.settings;
        if (updated) {
          setInitialData(updated);
          setFormData((prev) => ({ ...prev, ...updated }));
          setPreviews({
            logo: updated.logo || '',
            favicon: updated.favicon || '',
            heroBannerImage: updated.heroBannerImage || '',
            aboutImage: updated.aboutImage || ''
          });
          setFiles({});
        }
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to update website settings');
    } finally {
      setSaving(false);
    }
  };

  // Account Tab Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        toast.success('Admin Profile updated successfully');
        if (setUser) setUser(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!sharedCurrentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/auth/password', {
        currentPassword: sharedCurrentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setSharedCurrentPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (!sharedCurrentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      toast.error('New security PINs do not match!');
      return;
    }
    if (pinData.newPin.length < 4) {
      toast.error('Security PIN must be at least 4 digits long');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/auth/pin', {
        currentPassword: sharedCurrentPassword,
        newPin: pinData.newPin
      });
      if (res.success) {
        toast.success('Security PIN updated successfully!');
        setPinData({ newPin: '', confirmPin: '' });
        setSharedCurrentPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update security PIN');
    } finally {
      setSaving(false);
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'basic', label: '1. Basic Info', icon: Globe },
    { id: 'branding', label: '2. Branding', icon: ImageIcon },
    { id: 'hero', label: '3. Hero Section', icon: Layout },
    { id: 'about', label: '4. About Section', icon: UserCheck },
    { id: 'contact', label: '5. Contact Details', icon: PhoneCall },
    { id: 'social', label: '6. Social Links', icon: Share2 },
    { id: 'seo', label: '7. SEO', icon: Search },
    { id: 'account', label: '8. Account', icon: User }
  ];

  if (loading) {
    return <Loading fullScreen text="Loading Website Settings..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <SEO title="Website Settings | Admin Panel" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border p-6 rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-light text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>Site Configuration</span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-text">Website Settings</h1>
          <p className="text-xs text-text-light mt-1">
            Manage business info, branding, hero, about preview, contact details, social links & SEO.
          </p>
        </div>

        {activeTab !== 'account' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-text hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 border-b border-border pb-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-border text-text-light hover:text-text hover:bg-surface-muted'
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Form Panel */}
      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 1: BASIC INFORMATION */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'basic' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Globe className="text-primary" size={20} />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="websiteName" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Website Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="websiteName"
                  name="websiteName"
                  value={formData.websiteName || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="businessName" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Owner / Artist Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="tagline" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Website Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Years of Experience (Shared Stat)
                </label>
                <input
                  type="text"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 7+"
                />
              </div>

              <div>
                <label htmlFor="workingSince" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Working Since Year
                </label>
                <input
                  type="text"
                  id="workingSince"
                  name="workingSince"
                  value={formData.workingSince || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 2017"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="businessTiming" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Business Hours / Timing
                </label>
                <input
                  type="text"
                  id="businessTiming"
                  name="businessTiming"
                  value={formData.businessTiming || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 09:00 AM - 08:00 PM"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="shortDescription" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Short Description / Bio
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows={2}
                  value={formData.shortDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="fullAboutDescription" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Full About Story
                </label>
                <textarea
                  id="fullAboutDescription"
                  name="fullAboutDescription"
                  rows={4}
                  value={formData.fullAboutDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="Tell your complete journey, philosophy and background..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 2: BRANDING & MEDIA */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'branding' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-playfair text-xl font-bold text-text flex items-center gap-2">
                  <ImageIcon className="text-primary" size={20} />
                  <span>Branding & Media Assets</span>
                </h2>
                <p className="text-xs text-text-light mt-1">
                  Manage website Logo, Favicon, Hero Banner, & About Images. If an image is deleted, text defaults will be used.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Media Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Single Website Logo */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold uppercase tracking-wider text-text">Website Logo</span>
                    {previews.logo && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveMedia('logo');
                          toast.info('Logo deleted. Click "Save Media Settings" to confirm.');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete Logo</span>
                      </button>
                    )}
                  </div>
                  <div className="h-32 w-full rounded-xl border border-dashed border-border bg-surface flex items-center justify-center relative overflow-hidden">
                    {previews.logo ? (
                      <>
                        <img src={previews.logo} alt="Logo" className="h-full w-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveMedia('logo');
                            toast.info('Logo deleted. Click "Save Media Settings" to confirm.');
                          }}
                          className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Remove Logo"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-text-light font-medium">No Logo Uploaded</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] text-text-light mb-1 font-medium">Upload New Logo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('logo', e)}
                    className="w-full text-xs text-text-light cursor-pointer"
                  />
                </div>
              </div>

              {/* Website Favicon */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold uppercase tracking-wider text-text">Website Favicon</span>
                    {previews.favicon && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveMedia('favicon');
                          toast.info('Favicon deleted. Click "Save Media Settings" to confirm.');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete Favicon</span>
                      </button>
                    )}
                  </div>
                  <div className="h-32 w-full rounded-xl border border-dashed border-border bg-surface flex items-center justify-center relative overflow-hidden">
                    {previews.favicon ? (
                      <>
                        <img src={previews.favicon} alt="Favicon" className="h-12 w-12 object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveMedia('favicon');
                            toast.info('Favicon deleted. Click "Save Media Settings" to confirm.');
                          }}
                          className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Remove Favicon"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-text-light font-medium">No Favicon</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] text-text-light mb-1 font-medium">Upload New Favicon:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('favicon', e)}
                    className="w-full text-xs text-text-light cursor-pointer"
                  />
                </div>
              </div>

              {/* Hero Cover Image */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold uppercase tracking-wider text-text">Hero Cover Image</span>
                    {previews.heroBannerImage && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveMedia('heroBannerImage');
                          toast.info('Hero cover image deleted. Click "Save Media Settings" to confirm.');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete Image</span>
                      </button>
                    )}
                  </div>
                  <div className="h-32 w-full rounded-xl border border-dashed border-border bg-surface flex items-center justify-center relative overflow-hidden">
                    {previews.heroBannerImage ? (
                      <>
                        <img src={previews.heroBannerImage} alt="Hero Banner" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveMedia('heroBannerImage');
                            toast.info('Hero cover image deleted. Click "Save Media Settings" to confirm.');
                          }}
                          className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Remove Hero Cover Image"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-text-light font-medium">No Cover Image</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] text-text-light mb-1 font-medium">Upload New Cover Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('heroBannerImage', e)}
                    className="w-full text-xs text-text-light cursor-pointer"
                  />
                </div>
              </div>

              {/* About Section Image */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold uppercase tracking-wider text-text">About Section Image</span>
                    {previews.aboutImage && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveMedia('aboutImage');
                          toast.info('About image deleted. Click "Save Media Settings" to confirm.');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete Image</span>
                      </button>
                    )}
                  </div>
                  <div className="h-32 w-full rounded-xl border border-dashed border-border bg-surface flex items-center justify-center relative overflow-hidden">
                    {previews.aboutImage ? (
                      <>
                        <img src={previews.aboutImage} alt="About Image" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveMedia('aboutImage');
                            toast.info('About image deleted. Click "Save Media Settings" to confirm.');
                          }}
                          className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Remove About Image"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-text-light font-medium">No About Image</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] text-text-light mb-1 font-medium">Upload New About Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('aboutImage', e)}
                    className="w-full text-xs text-text-light cursor-pointer"
                  />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Media Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 3: HERO SECTION */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'hero' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Layout className="text-primary" size={20} />
              <span>Hero Section</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="heroTitle" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Hero Heading
                </label>
                <input
                  type="text"
                  id="heroTitle"
                  name="heroTitle"
                  value={formData.heroTitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroSubtitle" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Hero Sub Heading
                </label>
                <input
                  type="text"
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formData.heroSubtitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="heroDescription" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Hero Description
                </label>
                <textarea
                  id="heroDescription"
                  name="heroDescription"
                  rows={3}
                  value={formData.heroDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroButtonText" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  id="heroButtonText"
                  name="heroButtonText"
                  value={formData.heroButtonText || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroButtonLink" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  id="heroButtonLink"
                  name="heroButtonLink"
                  value={formData.heroButtonLink || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroSecondaryButtonText" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  id="heroSecondaryButtonText"
                  name="heroSecondaryButtonText"
                  value={formData.heroSecondaryButtonText || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroSecondaryButtonLink" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  id="heroSecondaryButtonLink"
                  name="heroSecondaryButtonLink"
                  value={formData.heroSecondaryButtonLink || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="heroOverlayOpacity" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Hero Overlay Opacity (0.0 to 1.0)
                </label>
                <input
                  type="text"
                  id="heroOverlayOpacity"
                  name="heroOverlayOpacity"
                  value={formData.heroOverlayOpacity || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="0.4"
                />
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 4: ABOUT SECTION */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <UserCheck className="text-primary" size={20} />
              <span>About Section & Highlights</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="aboutTitle" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  About Heading
                </label>
                <input
                  type="text"
                  id="aboutTitle"
                  name="aboutTitle"
                  value={formData.aboutTitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="aboutSubtitle" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  About Sub Heading
                </label>
                <input
                  type="text"
                  id="aboutSubtitle"
                  name="aboutSubtitle"
                  value={formData.aboutSubtitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="aboutShortDescription" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  About Description / Philosophy
                </label>
                <textarea
                  id="aboutShortDescription"
                  name="aboutShortDescription"
                  rows={3}
                  value={formData.aboutShortDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Experience Count (Unified Stat)
                </label>
                <input
                  type="text"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 7+"
                />
              </div>

              <div>
                <label htmlFor="happyClientsCount" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Happy Clients Count
                </label>
                <input
                  type="text"
                  id="happyClientsCount"
                  name="happyClientsCount"
                  value={formData.happyClientsCount || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 500+"
                />
              </div>

              <div>
                <label htmlFor="completedMakeovers" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Bridal / Completed Makeovers Count
                </label>
                <input
                  type="text"
                  id="completedMakeovers"
                  name="completedMakeovers"
                  value={formData.completedMakeovers || formData.bridalMakeoversCount || ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, bridalMakeoversCount: e.target.value }));
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 10+ or 800+"
                />
              </div>

              <div>
                <label htmlFor="certificationsCount" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Certifications Count
                </label>
                <input
                  type="text"
                  id="certificationsCount"
                  name="certificationsCount"
                  value={formData.certificationsCount || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="e.g. 15+"
                />
              </div>

              <div>
                <label htmlFor="ctaText" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  id="ctaText"
                  name="ctaText"
                  value={formData.ctaText || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="ctaLink" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  CTA Button Link
                </label>
                <input
                  type="text"
                  id="ctaLink"
                  name="ctaLink"
                  value={formData.ctaLink || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 5: CONTACT INFORMATION */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'contact' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <PhoneCall className="text-primary" size={20} />
              <span>Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="altPhone" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Alternative Phone
                </label>
                <input
                  type="text"
                  id="altPhone"
                  name="altPhone"
                  value={formData.altPhone || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="whatsappDefaultMessage" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  WhatsApp Default Pre-filled Message
                </label>
                <input
                  type="text"
                  id="whatsappDefaultMessage"
                  name="whatsappDefaultMessage"
                  value={formData.whatsappDefaultMessage || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Hello! I would like to inquire about booking a makeup appointment."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Complete Studio Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 6: SOCIAL LINKS */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'social' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Share2 className="text-primary" size={20} />
              <span>Social Links</span>
            </h2>

            <div className="space-y-4">

              {/* Instagram */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-background">
                <div className="space-y-1 flex-1">
                  <label htmlFor="instagram" className="block text-xs font-bold uppercase tracking-wider text-text">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-xs text-text focus:border-primary focus:outline-none"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleChange('instagramEnabled')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${formData.instagramEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {formData.instagramEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-background">
                <div className="space-y-1 flex-1">
                  <label htmlFor="facebook" className="block text-xs font-bold uppercase tracking-wider text-text">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-xs text-text focus:border-primary focus:outline-none"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleChange('facebookEnabled')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${formData.facebookEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {formData.facebookEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* YouTube */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-background">
                <div className="space-y-1 flex-1">
                  <label htmlFor="youtube" className="block text-xs font-bold uppercase tracking-wider text-text">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    id="youtube"
                    name="youtube"
                    value={formData.youtube || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-xs text-text focus:border-primary focus:outline-none"
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleChange('youtubeEnabled')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${formData.youtubeEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {formData.youtubeEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Pinterest */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-background">
                <div className="space-y-1 flex-1">
                  <label htmlFor="pinterest" className="block text-xs font-bold uppercase tracking-wider text-text">
                    Pinterest Profile URL
                  </label>
                  <input
                    type="url"
                    id="pinterest"
                    name="pinterest"
                    value={formData.pinterest || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-xs text-text focus:border-primary focus:outline-none"
                    placeholder="https://pinterest.com/yourprofile"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleChange('pinterestEnabled')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${formData.pinterestEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {formData.pinterestEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 7: SEO SETTINGS */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Search className="text-primary" size={20} />
              <span>Search Engine Optimization (SEO)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="metaTitle" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="Ankita Makeup | Professional Makeup Artist in Delhi"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="metaDescription" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  value={formData.metaDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="Explore professional bridal, party & fashion makeup services..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="metaKeywords" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Meta Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="makeup artist, bridal makeup, delhi makeup, hairstylist"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Author Meta Tag
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="canonicalUrl" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  id="canonicalUrl"
                  name="canonicalUrl"
                  value={formData.canonicalUrl || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="https://ankitamakeup.vercel.app"
                />
              </div>

              <div>
                <label htmlFor="googleAnalyticsId" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Google Analytics ID (e.g. G-XXXXXXXXXX)
                </label>
                <input
                  type="text"
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="googleSearchConsoleVerification" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Google Search Console Code
                </label>
                <input
                  type="text"
                  id="googleSearchConsoleVerification"
                  name="googleSearchConsoleVerification"
                  value={formData.googleSearchConsoleVerification || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="robotsMeta" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Robots Meta Instruction
                </label>
                <input
                  type="text"
                  id="robotsMeta"
                  name="robotsMeta"
                  value={formData.robotsMeta || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  placeholder="index, follow"
                />
              </div>
            </div>
          </div>
        )}

      </form>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 8: ACCOUNT & SECURITY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="space-y-6">

          {/* Admin Profile Details */}
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <User className="text-primary" size={20} />
              <span>Admin Account Details</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
              <div>
                <label htmlFor="adminUsername" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Admin Name / Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                  <input
                    type="text"
                    id="adminUsername"
                    value={profileData.username || ''}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Admin Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                  <input
                    type="email"
                    id="adminEmail"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>Save Profile Info</span>
              </button>
            </form>
          </div>

          {/* Change Password & Change Security PIN (2-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Column: Change Password */}
            <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
                <Lock className="text-primary" size={20} />
                <span>Change Password</span>
              </h2>

              <form onSubmit={handleUpdatePassword} className="space-y-5" name="change-password-form">
                <div>
                  <label htmlFor="oldPassword" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="oldPassword"
                      name="currentPassword"
                      autoComplete="current-password"
                      value={sharedCurrentPassword}
                      onChange={(e) => setSharedCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Change Security PIN */}
            <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <h2 className="font-playfair text-xl font-bold text-text border-b border-border pb-3 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <span>Change Security PIN</span>
              </h2>

              <form onSubmit={handleUpdatePin} className="space-y-5" name="change-pin-form">
                <div>
                  <label htmlFor="pinCurrentPassword" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="pinCurrentPassword"
                      name="currentPassword"
                      autoComplete="current-password"
                      value={sharedCurrentPassword}
                      onChange={(e) => setSharedCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                      placeholder="Enter current password to verify"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPin" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    New Security PIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="newPin"
                      maxLength={6}
                      value={pinData.newPin}
                      onChange={(e) => setPinData((prev) => ({ ...prev, newPin: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none font-mono"
                      placeholder="Enter new 4 to 6 digit numeric PIN"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPin" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Confirm New Security PIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-2.5 text-text-light" size={16} />
                    <input
                      type="password"
                      id="confirmPin"
                      maxLength={6}
                      value={pinData.confirmPin}
                      onChange={(e) => setPinData((prev) => ({ ...prev, confirmPin: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-text focus:border-primary focus:outline-none font-mono"
                      placeholder="Re-enter new security PIN"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Update Security PIN</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminSettings;
