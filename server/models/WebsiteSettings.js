const mongoose = require('mongoose');

const WebsiteSettingsSchema = new mongoose.Schema(
  {
    // Section 1: Basic Information
    websiteName: { type: String, default: 'Ankita Makeup', trim: true },
    businessName: { type: String, default: 'Ankita Makeup Studio', trim: true },
    ownerName: { type: String, default: 'Ankita', trim: true },
    tagline: { type: String, default: 'Professional Makeup & Hair Artist', trim: true },
    businessTiming: { type: String, default: '09:00 AM - 08:00 PM', trim: true },
    yearsOfExperience: { type: String, default: '7+', trim: true },
    workingSince: { type: String, default: '2017', trim: true },
    shortDescription: { type: String, default: 'Certified luxury makeup artist and hairstylist based in New Delhi.', trim: true },
    fullAboutDescription: { type: String, default: '', trim: true },

    // Section 2: Branding & Images
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    heroBannerImage: { type: String, default: '' },
    aboutImage: { type: String, default: '' },
    ownerProfileImage: { type: String, default: '' },

    // Section 3: Hero Section
    heroTitle: { type: String, default: 'Beautiful Makeup For Your Special Day', trim: true },
    heroSubtitle: { type: String, default: 'Professional Bridal & Fashion Makeup Artist', trim: true },
    heroDescription: { type: String, default: 'Beautiful makeup and hairstyles for brides, photo shoots, and special events. Based in Delhi.', trim: true },
    heroButtonText: { type: String, default: 'Book Appointment', trim: true },
    heroButtonLink: { type: String, default: '/booking', trim: true },
    heroSecondaryButtonText: { type: String, default: 'Explore Portfolio', trim: true },
    heroSecondaryButtonLink: { type: String, default: '/portfolio', trim: true },
    heroOverlayOpacity: { type: String, default: '0.4' },

    // Section 4: About Section
    aboutTitle: { type: String, default: 'My Story & Philosophy', trim: true },
    aboutSubtitle: { type: String, default: 'Dedicated to Timeless Elegance', trim: true },
    aboutShortDescription: { type: String, default: 'I believe that makeup should make you feel confident, not hide your face.', trim: true },
    happyClientsCount: { type: String, default: '500+', trim: true },
    completedMakeovers: { type: String, default: '800+', trim: true },
    certificationsCount: { type: String, default: '15+', trim: true },
    ctaText: { type: String, default: 'Book Your Session', trim: true },
    ctaLink: { type: String, default: '/contact', trim: true },

    // Section 5: Contact Details
    phone: { type: String, default: '+91 98765 43210', trim: true },
    altPhone: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '+91 98765 43210', trim: true },
    email: { type: String, default: 'ankitamakeup@gmail.com', trim: true },
    address: { type: String, default: 'New Delhi, India', trim: true },
    city: { type: String, default: 'New Delhi', trim: true },
    state: { type: String, default: 'Delhi', trim: true },
    country: { type: String, default: 'India', trim: true },
    pincode: { type: String, default: '110001', trim: true },

    // Section 6: Social Links
    instagram: { type: String, default: 'https://instagram.com' },
    instagramEnabled: { type: Boolean, default: true },
    facebook: { type: String, default: 'https://facebook.com' },
    facebookEnabled: { type: Boolean, default: true },
    youtube: { type: String, default: 'https://youtube.com' },
    youtubeEnabled: { type: Boolean, default: true },
    pinterest: { type: String, default: 'https://pinterest.com' },
    pinterestEnabled: { type: Boolean, default: true },

    // Section 7: SEO Settings
    metaTitle: { type: String, default: 'Ankita Makeup | Professional Makeup Artist', trim: true },
    metaDescription: { type: String, default: 'Explore professional makeup artist portfolio by Ankita in Delhi.', trim: true },
    metaKeywords: { type: String, default: 'makeup artist, delhi, bridal makeup, hairstyling', trim: true },
    canonicalUrl: { type: String, default: 'https://ankitamakeup.vercel.app' },
    googleAnalyticsId: { type: String, default: '' },
    googleSearchConsoleVerification: { type: String, default: '' },
    robotsMeta: { type: String, default: 'index, follow' },
    author: { type: String, default: 'Ankita' },
  },
  {
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.model('WebsiteSettings', WebsiteSettingsSchema);
